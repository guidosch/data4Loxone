import axios from "axios";
import { getStationsData } from '../logic/netatmoStationsData';
import { describeError } from '../logic/errorUtils';
import { Stationsdata } from "../types/stationsData";
import { MeteoOpenData } from "../types/meteoOpenData";

const LAMETRIC_URL: string = process.env["LAMETRIC_URL"] || "http://192.168.2.32:8080";
const LAMETRIC_API_KEY: string = process.env["LAMETRIC_API_KEY"] || "";
if (!LAMETRIC_API_KEY) {
    console.warn("LAMETRIC_API_KEY not set in .env, sending to Lametric will fail with 401");
}

//create axios instance for lametric
const axiosInstance = axios.create({
    baseURL: LAMETRIC_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        "Content-Length": 0
    },
    auth: {
        username: 'dev',
        password: LAMETRIC_API_KEY
    }
});

const SMA_URL: string = process.env["SMA_OPENDATA_URL"] || "url not set";

type LametricFrame = { icon: string, text: string | number };

/** Lametric answers 400 while in night/sleep mode; only log when this state changes */
let lametricSleeping = false;

export class LametricHandler {

    static async sendNetatmoToLaMetric() {
        let stationsdata: Stationsdata;
        try {
            stationsdata = await getStationsData();
        } catch (error) {
            // already logged in getStationsData()
            return;
        }
        const temp = stationsdata.dashboard_data.Temperature.toFixed(1);
        sendToLametric([
            { "icon": "i2355", "text": temp + "°C In" },
            { "icon": "i12785", "text": stationsdata.dashboard_data.CO2 },
            { "icon": "i3359", "text": stationsdata.dashboard_data.Humidity + "%" }
        ]);
    }

    //send SMA station data to lametric
    static async sendMeteoDataToLaMetric() {
        axios.get<MeteoOpenData>(SMA_URL, { timeout: 10000 }).then(function (response) {
            if (response.status == 200) {
                const data: MeteoOpenData = response.data;
                const frames: LametricFrame[] = [];

                frames.push({ "icon": "i2355", "text": data.temperature + "°C Out" });

                const rain = parseFloat(data.precipitation);
                /**
                 * todo
                 * Regen:
                    leicht: Niederschlagshöhe in 60 Minuten < 2,5 mm, in 10 Minuten < 0,5 mm
                    mäßig: Niederschlagshöhe in 60 Minuten ≥ 2,5 mm bis < 10,0 mm, in 10 Minuten ≥ 0,5 mm bis < 1,7 mm
                    stark: Niederschlagshöhe in 60 Minuten ≥ 10,0 mm, in 10 Minuten ≥ 1,7 mm
                    sehr stark: Niederschlagshöhe in 60 Minuten ≥ 50,0 mm, in 10 Minuten ≥ 8,3
                 */
                if (rain > 0) {
                    frames.push({ "icon": "i2416", "text": rain + "mm" });
                }
                frames.push({ "icon": "i9095", "text": Number.parseFloat(data.windSpeed).toFixed(1) + "/" + Number.parseFloat(data.gustPeak).toFixed(1) + "km/h" });

                sendToLametric(frames);
            }
        }).catch(function (error) {
            console.error("Error getting data from local SMA service: " + describeError(error));
        });

    }

}

function sendToLametric(frames: LametricFrame[]) {
    const laMetricFrame = {
        icon_type: "none",
        model: {
            frames: frames,
            cycles: 2
        }
    };
    if (!lametricSleeping) {
        console.log(`Sending to lametric: ${JSON.stringify(laMetricFrame)}`);
    }
    axiosInstance.post("/api/v2/device/notifications", laMetricFrame, {
        headers: { "Content-Length": Buffer.byteLength(JSON.stringify(laMetricFrame), "utf8") }
    }).then(function (response) {
        if (lametricSleeping) {
            lametricSleeping = false;
            console.log("Lametric is awake again, accepted data");
        } else if (response.status == 201) {
            console.log(`Lametric accepted data`);
        }
    }).catch(function (error) {
        if (error.response?.status === 400) {
            // LaMetric rejects notifications while in night/sleep mode; log only the transition
            if (!lametricSleeping) {
                lametricSleeping = true;
                console.log("Lametric returned 400 Bad Request. It is sleeping, suppressing further logs until it is awake again.");
            }
        } else {
            console.error("Error sending to LaMetric: " + describeError(error));
        }
    });
}
