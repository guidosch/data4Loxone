import NetatmoAxiosInterceptor from './netatmoRequestResponseInterceptor';
import { MainStation } from './devices';
import { Stationsdata } from '../types/stationsData';
import { describeError } from './errorUtils';

/**
 * Shared access to Netatmo api/getstationsdata for all consumers
 * (/netatmo, /stationsdata, Lametric job).
 *
 * - Responses are cached for CACHE_TTL_MS: Netatmo updates its data only every ~10 min,
 *   so polling it from several consumers every minute is wasted API calls.
 * - Concurrent callers share one in-flight request.
 * - If Netatmo fails, the last good data is served while it is younger than MAX_STALE_MS.
 */
const CACHE_TTL_MS = 60 * 1000;
const MAX_STALE_MS = 10 * 60 * 1000;

const netatmoHTTPClient = new NetatmoAxiosInterceptor();
const config = {
    params: MainStation
};

let cached: { device: Stationsdata, fetchedAt: number } | undefined;
let inFlight: Promise<Stationsdata> | undefined;

export async function getStationsData(): Promise<Stationsdata> {
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.device;
    }
    if (!inFlight) {
        inFlight = fetchStationsData().finally(() => {
            inFlight = undefined;
        });
    }
    return inFlight;
}

async function fetchStationsData(): Promise<Stationsdata> {
    try {
        const response = await netatmoHTTPClient.get('api/getstationsdata', config);
        const device: Stationsdata | undefined = response.data?.body?.devices?.[0];
        if (!device) {
            throw new Error('Netatmo getstationsdata response without devices');
        }
        cached = { device, fetchedAt: Date.now() };
        return device;
    } catch (error) {
        if (cached && Date.now() - cached.fetchedAt < MAX_STALE_MS) {
            const ageS = Math.round((Date.now() - cached.fetchedAt) / 1000);
            console.warn(`Netatmo getstationsdata failed (${describeError(error)}), serving cached data (${ageS}s old)`);
            return cached.device;
        }
        console.error('Netatmo getstationsdata failed: ' + describeError(error));
        throw error;
    }
}
