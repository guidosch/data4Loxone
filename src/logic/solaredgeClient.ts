import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { SolaredgeTokens } from '../types/solarEdge';

/**
 * SolarEdge Monitoring API v2 client with OAuth "Site Access" tokens.
 *
 * - Access token is valid 2h, refresh token ~14-30 days (unused).
 * - Every refresh returns a NEW refresh token and the old one is invalid immediately,
 *   so the new tokens are written to the tokenStorage right away.
 * - Token endpoint expects a JSON body incl. client_id/client_secret.
 *
 * Initial setup: put the tokens from the SolarEdge authorization (code exchange) into
 * tokenStorage/tokensSolaredge.json: {"access_token": "...", "refresh_token": "..."}
 * and set SOLAREDGE_CLIENT_ID / SOLAREDGE_CLIENT_SECRET in .env
 */
const basePath: string = __dirname.replace('/src/logic', '/tokenStorage');
const tokenFile = '/tokensSolaredge.json';
const TOKEN_URL = 'https://monitoringapi.solaredge.com/v2/oauth2/token';
const client_id = process.env["SOLAREDGE_CLIENT_ID"];
const client_secret = process.env["SOLAREDGE_CLIENT_SECRET"];

export default class SolaredgeClient {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: 'https://monitoringapi.solaredge.com/v2',
            timeout: 10000,
            headers: {
                "Cache-Control": "max-age=0",
                "Accept": "application/json",
            },
        });
    }

    /**
     * GET with the stored access token. On 401 (expired/invalid token) the tokens are
     * refreshed with the refresh token, saved, and the request is retried once.
     * If the stored token is already known to be expired the request is not sent
     * with it (each call costs an API credit), it is refreshed first.
     */
    async get<T>(url: string, params?: Record<string, string>): Promise<AxiosResponse<T>> {
        let tokens = readTokens();
        if (tokens.expires_at && Date.now() >= tokens.expires_at) {
            console.log('SolarEdge access token expired, refreshing.');
            tokens = await refreshTokens(tokens);
        }
        try {
            return await this.request<T>(url, tokens.access_token, params);
        } catch (error: any) {
            if (error.response?.status !== 401) {
                throw error;
            }
            console.log('SolarEdge returned 401, refreshing tokens.');
            tokens = await refreshTokens(readTokens());
            return this.request<T>(url, tokens.access_token, params);
        }
    }

    private request<T>(url: string, accessToken: string, params?: Record<string, string>): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, {
            params,
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
    }
}

async function refreshTokens(tokens: SolaredgeTokens): Promise<SolaredgeTokens> {
    if (!tokens.refresh_token) {
        throw new Error(`No SolarEdge refresh token in ${basePath + tokenFile}`);
    }
    if (!client_id || !client_secret) {
        throw new Error('SOLAREDGE_CLIENT_ID / SOLAREDGE_CLIENT_SECRET not set in .env');
    }
    try {
        const { data } = await axios.post(TOKEN_URL, {
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token,
            client_id: client_id,
            client_secret: client_secret
        }, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            timeout: 10000
        });
        if (!data.access_token || !data.refresh_token) {
            throw new Error('SolarEdge token response without access_token/refresh_token: ' + JSON.stringify(data));
        }
        const newTokens: SolaredgeTokens = {
            ...data,
            // keep 60s safety margin, default 2h if expires_in is missing
            expires_at: Date.now() + ((data.expires_in ?? 7200) - 60) * 1000
        };
        writeTokens(newTokens);
        console.log('SolarEdge tokens refreshed and saved.');
        return newTokens;
    } catch (err: any) {
        // a 400 "invalid refresh_token" means a new authorization in SolarEdge is required
        console.error('Error refreshing SolarEdge tokens: ' + JSON.stringify(err.response?.data ?? err.message));
        throw err;
    }
}

function readTokens(): SolaredgeTokens {
    return JSON.parse(readFileSync(basePath + tokenFile, 'utf8'));
}

/**
 * Write to a temp file and rename it, so a crash while writing can not destroy the
 * (single use) refresh token.
 */
function writeTokens(tokens: SolaredgeTokens) {
    const tmpFile = basePath + tokenFile + '.tmp';
    writeFileSync(tmpFile, JSON.stringify(tokens));
    renameSync(tmpFile, basePath + tokenFile);
}
