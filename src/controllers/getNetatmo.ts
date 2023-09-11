import { RequestHandler } from 'express'
import AxiosInterceptor from '../logic/netatmo/netatmoRequestResponseInterceptor'
import { MainStation } from '../logic/netatmo/devices';
import { ModuleDashboardData, Stationsdata } from '../types/stationsData';
import { NetatmoStationsData, emtpyNetatmoStationsData } from '../types/netatmoStationsData4Loxone';

const axiosInterceptor = new AxiosInterceptor();
const config = {
    params: MainStation
}

let error: string = "";


const getRoot: RequestHandler = async (req, res) => {
    let response = await axiosInterceptor.get('api/getstationsdata', config);
    
    if (response.status !== 200) {
        error = response.status + " " + response.statusText
        emtpyNetatmoStationsData.error = error;
        res.status(response.status).json(emtpyNetatmoStationsData);
    } else {
        const stationsdata: Stationsdata = response.data.body.devices[0];

        let roomModule = getModuleData(stationsdata, "Zimmer");
        let outdoorModule = getModuleData(stationsdata, "Outdoor");

        let netatmoStationsData: NetatmoStationsData = {
            temperatureMain: stationsdata.dashboard_data.Temperature,
            co2Main: stationsdata.dashboard_data.CO2,
            humidityMain: stationsdata.dashboard_data.Humidity -5 ,
            temperatureRoom: roomModule?.Temperature || 23,
            co2Room: roomModule?.CO2 || 500,
            humidityRoom: roomModule?.Humidity || 50,
            temperatureOutside: outdoorModule?.Temperature || 20,
            humidityOutside: outdoorModule?.Humidity || 50,
            lastUpdateSecondsAgo: Math.round(Date.now() / 1000) - (stationsdata.dashboard_data.time_utc),
            error: error
        }
        res.status(200).json(netatmoStationsData);
    }

}

function getModuleData(stationsdata: Stationsdata, moduleName: string): ModuleDashboardData | undefined {
    let module = stationsdata.modules.find(module => module.module_name === moduleName)?.dashboard_data;
    if (module) {
        return module;
    }
    console.error("Netamo module '" + moduleName + "' not found");
    return
}

export default getRoot
