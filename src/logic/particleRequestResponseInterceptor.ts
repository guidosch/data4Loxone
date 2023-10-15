import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { AuthConf, TokenResponse } from '../types/auth';
import { ParticleEvent } from '../types/particleEvent';

/**
 * config: Set base path for files
 */
const basePath: string = __dirname.replace('/src/logic', '/tokenStorage');
const tokenFile = '/tokensParticle.json';
const particle_username = process.env["PARTICLE_USERNAME"]
const particle_password = process.env["PARTICLE_PASSWORD"]

export default class AxiosInterceptor {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create();
        this.axiosInstance.defaults.baseURL = 'https://api.particle.io';

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
            
            /** see particle API docu
                 * curl https://api.particle.io/oauth/token \
                        -u particle:particle \
                        -d grant_type=password \
                        -d "username=guido.schnider@gmail.com" \
                        -d "password=pk(dxE8iG3k6Vnx[GzrpiK"

                        response:
                        {"token_type":"bearer","access_token":"1234","expires_in":7776000,"refresh_token":"asdf"}%
            */
            async function error(error) {
                if (error.response && error.response.status === 403) {
                    console.log('Received 403 Forbidden response');
                    let tokens = readTokens();
                    try {
                        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                        axios.defaults.headers.post['Authorization'] = 'particle:particle';
                        const { data } = await axios.create().post('https://api.particle.io/oauth/token', {
                            //refresh token call no supported by this client_id
                            grant_type: 'password',
                            username: particle_username,
                            password: particle_password
                        });
                        //write tokens
                        writeTokens(data);
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
     * 
     * 
     * @param url 
     * @param config 
     * @returns 
     */
    post(url: string, data: ParticleEvent): Promise<AxiosResponse> {
        return this.axiosInstance.post(url, data);
    }

}

function readTokens(): TokenResponse {
    let tokens = JSON.parse(readFileSync(basePath + tokenFile, 'utf8'));
    return tokens;
}

function writeTokens(tokens: TokenResponse) {
    writeFileSync(basePath + tokenFile, JSON.stringify(tokens));
}

