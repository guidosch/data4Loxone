import app from './app'
import config from './config'
import schedule from 'node-schedule';
import { LametricHandler } from './staticHandlers/lametricHandler';
import { SolarEdgeToParticleHandler } from './staticHandlers/solarEdgeToParticleHandler';

app.listen(config.port, () => {
    console.log(`🚀 ${config.name} ${config.version} 🚀`)
    console.log(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`)
})


schedule.scheduleJob("59 * * * * *", function () {
    //todo : only needed if I like to cache netatmo result and reuse in other calls
    //readFromNetatmoAPIMock();
});

//send netatmo data to lametric 
schedule.scheduleJob("30 * * * * *", function () {
    LametricHandler.sendToLaMetric();
});

// send sma station opendata to lametric
schedule.scheduleJob("40 * * * * *", function () {
    apistatus.meteoDataForLametric(lametricNetatmo.optionsLametric);
});

// send sma station data to particle devices in office
schedule.scheduleJob("*/20 * * * *", function () {
    apistatus.meteoDataForParticle();
});

// send solaredge PV power to particle device in KellerV2.1 T77
schedule.scheduleJob("*/30 * * * *", function () {
    SolarEdgeToParticleHandler.solarPowerDataForParticle();
});
