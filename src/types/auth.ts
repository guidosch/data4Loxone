export interface TokenResponse {
    access_token: string;
    expires_in: number;
    expire_in: number;
    scope: string[];
    refresh_token: string;
    /** epoch ms when the access token should be refreshed (set by this app, not by Netatmo) */
    expires_at?: number;
}

export interface AuthConf {
    client_id: string;
    client_secret: string;
    grant_type: string;
    refresh_token: string;
}
