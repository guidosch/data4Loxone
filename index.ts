import axios from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { MainStation } from './src/logic/netatmo/devices';
import { AuthConf, TokenResponse } from './src/types/auth';
import { Stationsdata } from './src/types/stationsData';

//todo make configurable
const auth: AuthConf = JSON.parse(readFileSync('../../authConf.json', 'utf8'));
const tokens: TokenResponse = JSON.parse(readFileSync('../../tokens.json', 'utf8'));
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';





async function authenticate() {
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
        //save token to file
        writeFileSync('../../tokens.json', JSON.stringify(data));
        console.log("Authenticated and token saved to file");

    } catch (error) {
        console.error(error);
    }
}

async function getstationsdata() {
    try {
        let config = {
            params: MainStation
        }

        const { data } = await axios.get('api/getstationsdata', config);
        const stationsdata: Stationsdata = data.body.devices[0];
        console.log("Temp. main: " + JSON.stringify(stationsdata.dashboard_data.Temperature));
        const outsideModule = stationsdata.modules.find(module => module.module_name === "Outdoor");
        if (outsideModule?.dashboard_data?.Temperature) {
            console.log("Temp. outside: " + JSON.stringify(outsideModule.dashboard_data.Temperature));
        }

    } catch (error: any) {
        console.error(error);
    }

}

getstationsdata();
