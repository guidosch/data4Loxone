import { RequestHandler } from 'express'
import AxiosInterceptor from '../logic/netatmoRequestResponseInterceptor'
import { MainStation } from '../logic/devices';
import { Stationsdata, Module } from '../types/stationsData';
import { NetatmoStationsHealthData } from '../types/netatmoHealthData4Loxone';

const axiosInterceptor = new AxiosInterceptor();
const config = {
    params: MainStation
}

let error: string = "";


const getRoot: RequestHandler = async (req, res) => {
    let response = await axiosInterceptor.get('api/getstationsdata', config);
    
    if (response.status !== 200) {
        error = response.status + " " + response.statusText
        res.status(response.status).json({ error: error });
    } else {
        const stationsdata: Stationsdata = response.data.body.devices[0];

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
