import app from './app'
import config from './config'
import schedule from 'node-schedule';
import { LametricHandler } from './staticHandlers/lametricHandler';
import { ParticleHandler as ParticleHandler } from './staticHandlers/particleHandler';

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
    LametricHandler.sendNetatmoToLaMetric();
});

// send sma station opendata to lametric
schedule.scheduleJob("40 * * * * *", function () {
    LametricHandler.sendMeteoDataToLaMetric();
});

// send sma station data to particle cloud API for devices in Ergon office
schedule.scheduleJob("*/20 * * * *", function () {
    ParticleHandler.meteoDataForParticle();
});

// send solaredge PV power to particle cloud for device in KellerV2.1 T77

schedule.scheduleJob("*/30 * * * *", function () {
    ParticleHandler.solarPowerDataForParticle();
});

