import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { AuthConf, TokenResponse } from '../../types/auth';
import { MainStation } from './devices';

export default class AxiosInterceptor {
    private axiosInstance: AxiosInstance;
    private auth: AuthConf;
    private tokens: TokenResponse;

    constructor() {
        this.axiosInstance = axios.create();
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        this.axiosInstance.defaults.baseURL = 'https://api.netatmo.com/';

        this.auth = JSON.parse(readFileSync('/Users/guidoschnider/programming/data4Loxone/authConf.json', 'utf8'));
        this.tokens = JSON.parse(readFileSync('/Users/guidoschnider/programming/data4Loxone/tokens.json', 'utf8'));

        // Add request interceptor
        this.axiosInstance.interceptors.request.use((config) => {
            if (config.headers && this.tokens && this.tokens.access_token) {
                config.headers['Authorization'] = `Bearer ${this.tokens.access_token}`;
            }
            return config;
        },
            this.requestErrorInterceptor
        );
        // Add response interceptor
        this.axiosInstance.interceptors.response.use(
            this.responseInterceptor,
            /** */
            async function error(error) {
                if (error.response && error.response.status === 403) {
                    console.log('Received 403 Forbidden response');
                    let auth: AuthConf = JSON.parse(readFileSync('/Users/guidoschnider/programming/data4Loxone/authConf.json', 'utf8'));
                    //console.log("Auth: "+JSON.stringify(auth));
                    let tokens: TokenResponse = JSON.parse(readFileSync('/Users/guidoschnider/programming/data4Loxone/tokens.json', 'utf8'));
                    if (tokens && tokens.refresh_token) {
                        auth.refresh_token = tokens.refresh_token;
                    }
                    try {
                        console.log("Authenticated via post to endpoint oauth2/token");
                        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                        const { data } = await axios.create().post('https://api.netatmo.com/oauth2/token', {
                            grant_type: auth.grant_type,
                            refresh_token: auth.refresh_token,
                            client_id: auth.client_id,
                            client_secret: auth.client_secret
                        });
                        //save token to file
                        console.log("Save token to file"+JSON.stringify(data));
                        writeFileSync('tokens.json', JSON.stringify(data));
                        console.log("Authenticated and token saved to file");
                        return data.access_token;
                
                    } catch (err: any) {
                        console.error("Error authenticate status: "+JSON.stringify(err));
                    }
                }
                console.log("Error: "+JSON.stringify(error));
                return Promise.reject(error);
            })
    }

    requestErrorInterceptor(error: any): Promise<never> {
        return Promise.reject(error);
    }

    responseInterceptor(response: AxiosResponse): AxiosResponse {
        return response;
    }


    async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.axiosInstance.get(url, config);
    }

    
}

/** 
// Usage
const axiosInterceptor = new AxiosInterceptor();
let config = {
    params: MainStation
}
let response = await axiosInterceptor.get('api/getstationsdata', config)
console.log(response);

*/
