import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { readFileSync, writeFileSync } from 'node:fs';
import { AuthConf, TokenResponse } from '../types/auth';
import { describeError } from './errorUtils';

/**
 * config: Set base path for tokens.json and authConf.json
 */
const basePath: string = __dirname.replace('/src/logic', '/tokenStorage');
const tokenFile = '/tokens.json';
const authConfFile = '/authConf.json';

/** Netatmo returns sporadic 5xx (mostly 503). Retry those once after a short delay. */
const RETRY_STATUS = [502, 503, 504];
const RETRY_DELAY_MS = 2000;
/** refresh the access token this long before it expires */
const EXPIRY_MARGIN_S = 60;

/** shared between all instances, so concurrent requests trigger only one refresh */
let refreshInFlight: Promise<TokenResponse> | undefined;

export default class AxiosInterceptor {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({ timeout: 10000 });
        this.axiosInstance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        this.axiosInstance.defaults.baseURL = 'https://api.netatmo.com/';

        // Add request interceptor: set Bearer token, refresh it first if it is known to be expired
        this.axiosInstance.interceptors.request.use(async (config) => {
            let tokens = readTokens();
            if (tokens.expires_at && Date.now() >= tokens.expires_at) {
                try {
                    tokens = await refreshTokens('access token expired');
                } catch (err) {
                    // send the request with the old token, the 401/403 handling below gets another chance
                    console.error('Error refreshing Netatmo token: ' + describeError(err));
                }
            }
            if (config.headers && tokens && tokens.access_token) {
                config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
            }
            return config;
        });

        // Add response interceptor: refresh token on 401/403, retry once on 5xx
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const status = error.response?.status;
                const originalRequest = error.config;

                if ((status === 401 || status === 403) && originalRequest && !originalRequest._retryAuth) {
                    originalRequest._retryAuth = true;
                    try {
                        await refreshTokens(`received ${status}`);
                        // retry the original request; the request interceptor sets the new Bearer token
                        return this.axiosInstance(originalRequest);
                    } catch (err) {
                        console.error('Error refreshing Netatmo token: ' + describeError(err));
                    }
                }

                if (RETRY_STATUS.includes(status) && originalRequest && !originalRequest._retry5xx) {
                    originalRequest._retry5xx = true;
                    console.log(`Netatmo returned ${status}, retrying in ${RETRY_DELAY_MS} ms`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    return this.axiosInstance(originalRequest);
                }

                return Promise.reject(error);
            });
    }

    /**
     * Async get request with auth. token interceptor, 401/403 refresh token and 5xx retry interceptor
     */
    async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.axiosInstance.get(url, config);
    }

}

/**
 * Refresh the access token with the stored refresh token. Concurrent callers share one refresh.
 */
function refreshTokens(reason: string): Promise<TokenResponse> {
    if (!refreshInFlight) {
        refreshInFlight = doRefreshTokens(reason).finally(() => {
            refreshInFlight = undefined;
        });
    }
    return refreshInFlight;
}

async function doRefreshTokens(reason: string): Promise<TokenResponse> {
    console.log(`Refreshing Netatmo token (${reason})`);
    const auth = readAuthConf();
    const tokens = readTokens();
    if (tokens && tokens.refresh_token) {
        auth.refresh_token = tokens.refresh_token;
    }
    const { data } = await axios.post<TokenResponse>('https://api.netatmo.com/oauth2/token', {
        grant_type: auth.grant_type,
        refresh_token: auth.refresh_token,
        client_id: auth.client_id,
        client_secret: auth.client_secret
    }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
    });
    const newTokens: TokenResponse = {
        ...data,
        // default 3h if expires_in is missing
        expires_at: Date.now() + ((data.expires_in ?? 10800) - EXPIRY_MARGIN_S) * 1000
    };
    //write tokens and update refresh token in authConf
    writeTokens(newTokens, auth);
    return newTokens;
}

function readTokens(): TokenResponse {
    const tokens = JSON.parse(readFileSync(basePath + tokenFile, 'utf8'));
    return tokens;
}

function readAuthConf(): AuthConf {
    const auth = JSON.parse(readFileSync(basePath + authConfFile, 'utf8'));
    return auth;
}

function writeTokens(tokens: TokenResponse, auth: AuthConf) {
    auth.refresh_token = tokens.refresh_token;
    writeFileSync(basePath + tokenFile, JSON.stringify(tokens));
    writeFileSync(basePath + authConfFile, JSON.stringify(auth));
}
