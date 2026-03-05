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
            this.errorInterceptor.bind(this)
        );
    }

    requestErrorInterceptor(error: any): Promise<never> {
        return Promise.reject(error);
    }

    responseInterceptor(response: AxiosResponse): AxiosResponse {
        return response;
    }

    async errorInterceptor(error: any): Promise<any> {
        let httpStatus = error.response?.status;
        if (error.response && (httpStatus === 403 || httpStatus === 401)) {
            console.log('Received 40x response:' + error.response.status);
            let tokens = readTokens();
            try {
                const authHeader = 'Basic ' + Buffer.from('particle:particle').toString('base64');
                const params = new URLSearchParams();
                params.append('grant_type', 'password');
                params.append('username', particle_username!);
                params.append('password', particle_password!);
                const { data } = await axios.post('https://api.particle.io/oauth/token', params.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': authHeader
                    }
                });
                // write tokens
                writeTokens(data);
                // Retry the original request with new token
                return this.axiosInstance.request(error.config);
            } catch (err: any) {
                console.error("Error authenticate status: " + JSON.stringify(err));
            }
        }
        console.error("Error: " + JSON.stringify(error));
        return Promise.reject(error);
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

