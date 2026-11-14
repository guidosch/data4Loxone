## Auth Tokens

### Netatmo 
* authConf.json --> Netatmo (weather station) OAuth2 client config: client_id, client_secret, grant_type and the current refresh_token. Used together with tokens.json by src/logic/netatmoRequestResponseInterceptor.ts to refresh access to api.netatmo.com. No manual steps known to be needed to recreate it; keep it, since it holds the app's Netatmo client credentials.
* tokens.json --> Netatmo (weather station) access/refresh tokens (access_token, expires_in, scope, refresh_token), paired with authConf.json. Refreshed automatically on a 403 from api.netatmo.com.

### Particle

 * tokensParticle.json --> Particle Cloud (api.particle.io) access/refresh tokens, used to push meteo and solar-surplus events to a Particle device. Can be recreated automatically using PARTICLE_USERNAME/PARTICLE_PASSWORD from .env (password-grant login), no manual browser step needed.

 ### Solaredge
 
 * tokensSolaredge.json --> SolarEdge Monitoring API v2 "Site Access" OAuth tokens (access_token, refresh_token, expires_at), used to read solar power telemetry for the Particle surplus-power event. Needs a browser in the loop to get a code that can be exchanged for a pair of tokens. See solarpanel-dirtyness-checker repo for a how to.
