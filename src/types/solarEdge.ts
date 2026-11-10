export interface Solaredge {
    siteCurrentPowerFlow: SiteCurrentPowerFlow;
}

export interface SiteCurrentPowerFlow {
    updateRefreshRate: number;
    unit:              string;
    connections:       Connection[];
    GRID:              Grid;
    LOAD:              Grid;
    PV:                Grid;
}

export interface Grid {
    status:       string;
    currentPower: number;
}

export interface Connection {
    from: string;
    to:   string;
}

/**
 * Content of tokenStorage/tokensSolaredge.json (OAuth Site Access tokens, API v2)
 */
export interface SolaredgeTokens {
    access_token:  string;
    refresh_token: string;
    expires_in?:   number;
    token_type?:   string;
    /** epoch millis, set by the app after a refresh */
    expires_at?:   number;
}

/**
 * API v2 GET /sites/{id}/meters/telemetry
 * {"period": {...}, "resolution": "QUARTER_HOUR",
 *  "meters": {"<serial>": {"exportPower": {"unit": "W", "values": [{"timestamp": "...", "value": 1500}]}, ...}}}
 */
export interface SolaredgeMetersTelemetry {
    resolution?: string;
    meters:      { [serial: string]: { [metric: string]: SolaredgeSeries } };
}

export interface SolaredgeSeries {
    unit?:  string;
    values: { timestamp: string; value: number | null }[];
}
