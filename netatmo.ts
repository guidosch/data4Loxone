/** */

import axios, { AxiosError } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { MainStation } from './src/logic/netatmo/devices';
import { AuthConf, TokenResponse } from './src/types/auth';
import { ModuleDashboardData, Stationsdata } from './src/types/stationsData';
import { NetatmoStationsData } from './src/types/netatmoStationsData4Loxone';
import { get } from 'node:http';

//todo make configurable
const auth: AuthConf = JSON.parse(readFileSync('../../authConf.json', 'utf8'));
const tokens: TokenResponse = JSON.parse(readFileSync('../../tokens.json', 'utf8'));
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

/**
axios.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
    config.baseURL = 'https://api.netatmo.com/';
    return config;
}, (error) => {
    Promise.reject(error);
});

axios.interceptors.response.use((response) => {
    return response
}, async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        const tokenResponse: TokenResponse = await this.authenticate();
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokenResponse.access_token;
        return axios.request(originalRequest);
    }
    return Promise.reject(error);
});

 */

export default class Netatmo {
    

    constructor() {
        this.initAxiosInterceptors();
    }

    initAxiosInterceptors():void {
        // Response interceptor for API calls
        

        // Response interceptor for API calls
        
    }

    public async authenticate(): Promise<TokenResponse | AxiosError> {
        if (tokens.refresh_token) {
            auth.refresh_token = tokens.refresh_token;
        }
        try {
            const { data } = await axios.post('oauth2/token', {
                grant_type: auth.grant_type,
                refresh_token: auth.refresh_token,
                client_id: auth.client_id,
                client_secret: auth.client_secret
            });
            if (data) {
                //save token to file
                writeFileSync('../../tokens.json', JSON.stringify(data));
                console.log("Authenticated and token saved to file");
                return data;
            }
            return data;
        } catch (error: any) {
            console.error(error);
            return error as AxiosError;
        }
    }

    async getstationsdata(): Promise<NetatmoStationsData | AxiosError>  {
        try {
            let config = {
                params: MainStation
            }
    
            const { data } = await axios.get('api/getstationsdata', config);
            const stationsdata: Stationsdata = data.body.devices[0];
            console.log("Temp. main: " + JSON.stringify(stationsdata.dashboard_data.Temperature));
            let roomModule = getModuleData(stationsdata, "Room");
            let outdoorModule = getModuleData(stationsdata, "Outdoor");
            
            let netatmoStationsData: NetatmoStationsData = {
                temperatureMain: stationsdata.dashboard_data.Temperature,
                co2Main: stationsdata.dashboard_data.CO2,
                humidityMain: stationsdata.dashboard_data.Humidity,
                temperatureRoom: roomModule?.Temperature || 23,
                co2Room: roomModule?.CO2 || 500,
                humidityRoom: roomModule?.Humidity || 50,
                temperatureOutside: outdoorModule?.Temperature || 20,
                humidityOutside: outdoorModule?.Humidity || 50,
                lastUpdateSecondsAgo: 60,
                error: ""
            }
            return netatmoStationsData;
    
        } catch (error: any) {
            console.error(error);
            return error;
        }
    }


}
function getModuleData(stationsdata: Stationsdata, moduleName: string): ModuleDashboardData | undefined {
    return stationsdata.modules.find(module => module.module_name === moduleName)?.dashboard_data;
}
