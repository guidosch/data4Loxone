import axios, { AxiosResponse } from "axios";
import ParticleAxiosIntercepter from '../logic/particleRequestResponseInterceptor';
import { particleEventSolarPower, particleEventMeteoData } from "../types/particleEvent";
import { SolaredgeMetersTelemetry } from "../types/solarEdge";
import SolaredgeClient from "../logic/solaredgeClient";
import { MeteoOpenData } from "../types/meteoOpenData";

// solaredge config (API v2, OAuth tokens in tokenStorage/tokensSolaredge.json)
const SITE = 2801781;

const SMA_URL = process.env["SMA_OPENDATA_URL"] || "url not set";

const solaredgeClient = new SolaredgeClient();

const particleHttpClient = new ParticleAxiosIntercepter();

export class ParticleHandler {


    /**
     * Fetch SMA data from local service and push to particle cloud
     */
    static async meteoDataForParticle() {
        axios.get<MeteoOpenData>(SMA_URL).then(function (response) {
            if (response.status == 200) {
                let data: MeteoOpenData = response.data;
                let event = particleEventMeteoData();
                event.data = ParticleHandler.mapDataToResult(data);

                particleHttpClient.post('/v1/devices/events', event)
                    .then(function (response: AxiosResponse): void {
                        console.log(`response from particle.: ${JSON.stringify(response.data)}`);
                    })
                    .catch(function (error: any) {
                        console.log("Error sending data to particle: " + JSON.stringify(error));
                    });

            }
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.toJSON());
        });

    }

    private static mapDataToResult(data: MeteoOpenData): string {
        let result = {
            sunshine: "",
            gustPeak: "",
            outsidetemperature: "",
            outsidehumidity: "",
            precipitation: "",
            status: "ok"
        };

        result.sunshine = data.sunshine;
        result.gustPeak = data.gustPeak;
        result.outsidetemperature = data.temperature;
        result.outsidehumidity = data.humidity;
        result.precipitation = data.precipitation;

        return JSON.stringify(result);
    }


    /** example event
     * curl https://api.particle.io/v1/devices/events \
    -d "name=myevent" \
    -d "data=Hello World" \
    -d "private=true" \
    -d "ttl=60" \
    -d "access_token=1234"
        */
    static async solarPowerDataForParticle() {

        //get data from solaredge (API v2, basic tier: meters telemetry, 15min buckets of the last hour)
        //The v1 endpoint currentPowerFlow is now /v2/sites/{id}/power-flow but needs an "Advanced Monitoring" plan.
        const now = new Date();
        const params = {
            resolution: 'QUARTER_HOUR',
            from: ParticleHandler.isoInstant(new Date(now.getTime() - 60 * 60 * 1000)),
            to: ParticleHandler.isoInstant(now)
        };
        solaredgeClient.get<SolaredgeMetersTelemetry>(`/sites/${SITE}/meters/telemetry`, params).then(function (response) {
            if (response.status == 200) {
                let hasSolarPower = ParticleHandler.hasUnusedSolarPower(response.data);
                let event = particleEventSolarPower();
                event.data = hasSolarPower.toString();

                particleHttpClient.post('/v1/devices/events', event)
                    .then(function (response: AxiosResponse): void {
                        console.log(`response from particle.: ${JSON.stringify(response.data)}`);
                    })
                    .catch(function (error: any) {
                        console.log("Error sending data to particle: " + JSON.stringify(error));
                    });
            }
        }).catch(function (error) {
            console.log("Error requesting data from solaredge: " + JSON.stringify(error.response?.data ?? error.message));
        });
    }

    /**
     * API v2 expects an ISO instant with zone, e.g. 2026-11-06T21:17:39Z
     * (a local date-time without offset is rejected with 400 "Failed to convert ... to required type [Instant]")
     */
    private static isoInstant(date: Date): string {
        return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    /**
     * Unused solar power = power is currently exported to the grid
     * (v1 logic was: PV active and flows PV->LOAD and LOAD->GRID).
     * Uses the latest non-empty 15min bucket of the meter's export power.
     *
     * example data
     * {"resolution": "QUARTER_HOUR",
     *  "meters": {"<serial>": {
     *      "exportPower": {"unit": "W", "values": [{"timestamp": "2026-09-29T12:15:00+01:00", "value": 1500}]},
     *      "productionPower": {"unit": "W", "values": [...]}
     *  }}}
     */
    private static hasUnusedSolarPower(data: SolaredgeMetersTelemetry): boolean {
        console.log(JSON.stringify(data));
        let exportPower: number | undefined;
        Object.values(data.meters ?? {}).forEach(metrics => {
            Object.entries(metrics).forEach(([metric, series]) => {
                if (metric.match(/^export.*power$/i)) {
                    const latest = series.values?.filter(v => v.value !== null && v.value !== undefined).pop();
                    if (latest) {
                        exportPower = (exportPower ?? 0) + Number(latest.value);
                    }
                }
            });
        });
        if (exportPower === undefined) {
            console.log("No export power found in solaredge meters telemetry.");
            return false;
        }
        return exportPower > 0;
    }

}
