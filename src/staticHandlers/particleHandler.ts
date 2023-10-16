import axios, { AxiosResponse } from "axios";
import ParticleAxiosIntercepter from '../logic/particleRequestResponseInterceptor';
import { particleEventSolarPower, particleEventMeteoData } from "../types/particleEvent";
import { Solaredge } from "../types/solarEdge";
import { MeteoOpenData } from "../types/meteoOpenData";

// solaredge config
const API_KEY = process.env["API_KEY_SOLAREDGE"] //see 1password for user
const SITE = 2801781;

const SMA_URL = process.env["SMA_OPENDATA_URL"] || "url not set";

const axiosInstance = axios.create({
    baseURL: 'https://monitoringapi.solaredge.com',
    timeout: 5000,
    headers: {
        "Cache-Control": "max-age=0",
        "Accept": "application/json",
    },

});

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
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        });

    }

    private static mapDataToResult(data: MeteoOpenData):string{
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

        //get data from solaredge
        axiosInstance.get(`/site/${SITE}/currentPowerFlow?api_key=${API_KEY}`).then(function (response) {
            if (response.status == 200) {
                let hasSolarPower = ParticleHandler.hasUnusedSolasPower(response.data);
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
            console.log("Error requesting data from solaredge: " + JSON.stringify(error));
        });
    }



    /** example data
     * {
        "siteCurrentPowerFlow": {
            "updateRefreshRate": 3,
            "unit": "kW",
            "connections": [
                {
                    "from": "GRID",
                    "to": "Load"
                }
            ],
            "GRID": {
                "status": "Active",
                "currentPower": 16.19
            },
            "LOAD": {
                "status": "Active",
                "currentPower": 16.19
            },
            "PV": {
                "status": "Idle",
                "currentPower": 0
            }
        }
    }
     */
    private static hasUnusedSolasPower(solaredgeData: Solaredge): boolean {
        console.log(JSON.stringify(solaredgeData));
        let connections = solaredgeData.siteCurrentPowerFlow.connections;
        let powerCount = 0;
        if (solaredgeData.siteCurrentPowerFlow.PV.status.match(/active/i)) {
            connections.forEach(connection => {
                if (connection.from.match(/pv/i) && connection.to.match(/load/i)) {
                    powerCount++;
                }
                if (connection.from.match(/load/i) && connection.to.match(/grid/i)) {
                    powerCount++;
                }
            });
        }
        if (powerCount == 2) {
            return true;
        }
        return false;
    }

}
