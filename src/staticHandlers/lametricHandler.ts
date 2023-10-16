import axios from "axios";
import { MainStation } from '../logic/devices';
import NetatmoAxiosInterceptor from '../logic/netatmoRequestResponseInterceptor'
import { Stationsdata } from "../types/stationsData";
import { MeteoOpenData } from "../types/meteoOpenData";

//create axios instance for lametric
const axiosInstance = axios.create({
    baseURL: 'http://192.168.2.32:8080',
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        "Content-Length": 0
    },
    auth: {
        username: 'dev',
        password:'a06055aec93a298ea3672c7d81ba7d2b4fa14933654a245831d335233c43e00f'
    }
});

const SMA_URL:string= process.env["SMA_OPENDATA_URL"] || "url not set";
const netatmoHTTPClient = new NetatmoAxiosInterceptor();
const config = {
    params: MainStation
}

// Lametric frame post data format
let frames: Object[] = [];
let laMetricFrame = {
    icon_type: "none",
    model: {
        frames: frames,
        cycles: 2
    }
};

export class LametricHandler {

    static async sendNetatmoToLaMetric() {

        let response = await netatmoHTTPClient.get('api/getstationsdata', config);

        if (response.status == 200) {
        const stationsdata: Stationsdata = response.data.body.devices[0];
        const temp = stationsdata.dashboard_data.Temperature.toFixed(1)

        laMetricFrame.model.frames.push({ "icon": "i2355", "text": temp + "°C In" });
        laMetricFrame.model.frames.push({ "icon": "i12785", "text": stationsdata.dashboard_data.CO2 });
        laMetricFrame.model.frames.push({ "icon": "i3359", "text": stationsdata.dashboard_data.Humidity + "%" });

        sendToLametric();
        } else {
            console.log("Error getting data from netatmo. HTTP Status: " + response.status + " " + response.statusText);
        }
    }

    //send SMA station data to lametric
    static async sendMeteoDataToLaMetric() {
        //todo ip configurable
        let response = axios.get<MeteoOpenData>(SMA_URL).then(function (response) {
            if (response.status == 200) {
                let data: MeteoOpenData = response.data;

                laMetricFrame.model.frames.push({ "icon": "i2355", "text": data.temperature + "°C Out" });

                var rain = parseFloat(data.precipitation);
                /**
                 * todo
                 * Regen:
                    leicht: Niederschlagshöhe in 60 Minuten < 2,5 mm, in 10 Minuten < 0,5 mm
                    mäßig: Niederschlagshöhe in 60 Minuten ≥ 2,5 mm bis < 10,0 mm, in 10 Minuten ≥ 0,5 mm bis < 1,7 mm
                    stark: Niederschlagshöhe in 60 Minuten ≥ 10,0 mm, in 10 Minuten ≥ 1,7 mm
                    sehr stark: Niederschlagshöhe in 60 Minuten ≥ 50,0 mm, in 10 Minuten ≥ 8,3
                 */
                if (rain > 0) {
                    laMetricFrame.model.frames.push({ "icon": "i2416", "text": rain + "mm" });
                }
                laMetricFrame.model.frames.push({ "icon": "i9095", "text": Number.parseFloat(data.windSpeed).toFixed(1) + "/" + Number.parseFloat(data.gustPeak).toFixed(1) + "km/h" });

                sendToLametric();
            }
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.status);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        });

    }

}
function sendToLametric() {
    console.log(`Sending to lametric: ${JSON.stringify(laMetricFrame)}`);
    axiosInstance.defaults.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(laMetricFrame), "utf8");
    axiosInstance.post("/api/v2/device/notifications", laMetricFrame).then(function (response) {
        if (response.status == 201) {
            console.log(`Lametric accepted data`);
        }
    }).catch(function (error) {
        console.log("Error sending to LaMetric: " + JSON.stringify(error));
    }).finally(function () {
        laMetricFrame.model.frames = [];
    });
}

