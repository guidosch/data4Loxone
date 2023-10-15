import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { AuthConf, TokenResponse } from '../types/auth';

/**
 * config: Set base path for tokens.json and authConf.json
 */
const basePath: string = __dirname.replace('/src/logic', '/tokenStorage');
const tokenFile = '/tokens.json';
const authConfFile = '/authConf.json';

export default class AxiosInterceptor {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create();
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        this.axiosInstance.defaults.baseURL = 'https://api.netatmo.com/';

        // Add request interceptor
        this.axiosInstance.interceptors.request.use((config) => {
            let tokens = readTokens();
            if (config.headers && tokens && tokens.access_token) {
                config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
            }
            return config;
        },
            this.requestErrorInterceptor
        );


        // Add response interceptor
        this.axiosInstance.interceptors.response.use(
            this.responseInterceptor,
            /** 
             * may be try to auto resend the request
             * https://stackoverflow.com/questions/51563821/axios-interceptors-retry-original-request-and-access-original-promise
             * 
            */
            async function error(error) {
                if (error.response && error.response.status === 403) {
                    console.log('Received 403 Forbidden response');
                    let auth = readAuthConf();
                    let tokens = readTokens();
                    if (tokens && tokens.refresh_token) {
                        auth.refresh_token = tokens.refresh_token;
                    }
                    try {
                        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                        const { data } = await axios.create().post('https://api.netatmo.com/oauth2/token', {
                            grant_type: auth.grant_type,
                            refresh_token: auth.refresh_token,
                            client_id: auth.client_id,
                            client_secret: auth.client_secret
                        });
                        //write tokens and update refresh token in authConf
                        writeTokens(data, auth);
                        return data.access_token;

                    } catch (err: any) {
                        console.error("Error authenticate status: " + JSON.stringify(err));
                    }
                }
                console.error("Error: " + JSON.stringify(error));
                return Promise.reject(error);
            })
    }

    requestErrorInterceptor(error: any): Promise<never> {
        return Promise.reject(error);
    }

    responseInterceptor(response: AxiosResponse): AxiosResponse {
        return response;
    }

    /**
     * Asyc get request with auth. token interceptor and 403 refresh token interceptor
     * 
     * @param url 
     * @param config 
     * @returns 
     */
    async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.axiosInstance.get(url, config);
    }

}

function readTokens(): TokenResponse {
    let tokens = JSON.parse(readFileSync(basePath + tokenFile, 'utf8'));
    return tokens;
}

function readAuthConf(): AuthConf {
    let auth = JSON.parse(readFileSync(basePath + authConfFile, 'utf8'));
    return auth;
}

function writeTokens(tokens: TokenResponse, auth: AuthConf) {
    auth.refresh_token = tokens.refresh_token;
    writeFileSync(basePath + tokenFile, JSON.stringify(tokens));
    writeFileSync(basePath + authConfFile, JSON.stringify(auth));
}

