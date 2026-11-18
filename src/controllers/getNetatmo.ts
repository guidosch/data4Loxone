import { RequestHandler } from 'express'
import { getStationsData } from '../logic/netatmoStationsData';
import { describeError } from '../logic/errorUtils';
import { ModuleDashboardData, Stationsdata } from '../types/stationsData';
import { NetatmoStationsData, fallbackNetatmoData } from '../types/netatmoStationsData4Loxone';

const getRoot: RequestHandler = async (req, res) => {
    let stationsdata: Stationsdata;
    try {
        stationsdata = await getStationsData();
    } catch (error) {
        // already logged in getStationsData()
        res.status(503).json(fallbackNetatmoData);
        return;
    }

    try {

        let roomModule = getModuleData(stationsdata, "Zimmer");
        let outdoorModule = getModuleData(stationsdata, "Outdoor");

        let netatmoStationsData: NetatmoStationsData = {
            temperatureMain: stationsdata.dashboard_data.Temperature,
            co2Main: stationsdata.dashboard_data.CO2,
            humidityMain: stationsdata.dashboard_data.Humidity - 5,
            temperatureRoom: roomModule?.Temperature || 23,
            co2Room: roomModule?.CO2 || 500,
            humidityRoom: roomModule?.Humidity || 50,
            temperatureOutside: outdoorModule?.Temperature || 20,
            humidityOutside: outdoorModule?.Humidity || 50,
            lastUpdateSecondsAgo: Math.round(Date.now() / 1000) - (stationsdata.dashboard_data.time_utc),
            error: "no error"
        }
        res.status(200).json(netatmoStationsData);
    } catch (error) {
        console.error("Error mapping Netatmo data: " + describeError(error));
        res.status(503).json(fallbackNetatmoData);
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
