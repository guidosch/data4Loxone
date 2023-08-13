export interface TokenResponse {
    access_token: string;
    expires_in: number;
    expire_in: number;
    scope: string[];
    refresh_token: string;
}

export interface AuthConf {
    client_id: string;
    client_secret: string;
    grant_type: string;
    refresh_token: string;
}
