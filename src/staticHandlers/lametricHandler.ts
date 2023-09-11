import axios from "axios";
import { MainStation } from '../logic/netatmo/devices';
import AxiosInterceptor from '../logic/netatmo/netatmoRequestResponseInterceptor'
import { Stationsdata } from "../types/stationsData";

const axiosInstance = axios.create({
    baseURL: 'http://192.168.2.32:8080',
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        "Content-Length": 0
    },

});

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

    static async sendToLaMetric() {

        const axiosInterceptor = new AxiosInterceptor();
        const config = {
            params: MainStation
        }

        let response = await axiosInterceptor.get('api/getstationsdata', config);
        
        const stationsdata: Stationsdata = response.data.body.devices[0];
        const temp = stationsdata.dashboard_data.Temperature.toFixed(1)
        
        laMetricFrame.model.frames.push({ "icon": "i2355", "text":  temp + "°C In" });
        laMetricFrame.model.frames.push({ "icon": "i12785", "text": stationsdata.dashboard_data.CO2 });
        laMetricFrame.model.frames.push({ "icon": "i3359", "text": stationsdata.dashboard_data.Humidity + "%" });

        axiosInstance.defaults.headers["Content-Length"] = Buffer.byteLength(JSON.stringify(laMetricFrame), "utf8");
        axiosInstance.post("/api/v2/device/notifications",laMetricFrame).then(function (response) {
            if (response.status == 200) {
                console.log(`response from netatmo to lametric req.: ${response}`);
            }
        }).catch(function (error) {
            console.log("Error sending to LaMetric: " + JSON.stringify(error));
        });
    }

}
