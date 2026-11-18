import { RequestHandler } from 'express'
import { getStationsData } from '../logic/netatmoStationsData';
import { describeError } from '../logic/errorUtils';
import { Stationsdata, Module } from '../types/stationsData';
import { NetatmoStationsHealthData, emtpyNetatmoStationsHealthData } from '../types/netatmoHealthData4Loxone';


const getRoot: RequestHandler = async (req, res) => {

    let stationsdata: Stationsdata;
    try {
        stationsdata = await getStationsData();
    } catch (error) {
        // already logged in getStationsData()
        res.status(503).json(emtpyNetatmoStationsHealthData);
        return;
    }

    try {
        let roomModule = getModuleData(stationsdata, "Zimmer");
        let outdoorModule = getModuleData(stationsdata, "Outdoor");

        let netatmoStationsHealthData: NetatmoStationsHealthData = {
            mainModuleName: stationsdata.module_name,
            mainOnline: stationsdata.reachable ? 1 : 0,
            module1: roomModule?.module_name || '',
            module1Online: roomModule?.reachable ? 1 : 0,
            module2: 'zimmer2',
            module2Online: 0,
            moduleOutdoorName: outdoorModule?.module_name || '',
            moduleOutdoorOnline: outdoorModule?.reachable ? 1 : 0
        }
        res.status(200).json(netatmoStationsHealthData);
    }
    catch (error) {
        console.error("Error mapping Netatmo data: " + describeError(error));
        res.status(503).json(emtpyNetatmoStationsHealthData);
    }

}

function getModuleData(stationsdata: Stationsdata, moduleName: string): Module | undefined {
    let module = stationsdata.modules.find(module => module.module_name === moduleName);
    if (module) {
        return module;
    }
    console.error("Netamo module '" + moduleName + "' not found");
    return undefined;
}

export default getRoot
