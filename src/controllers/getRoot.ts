import { RequestHandler } from 'express'
import config from '../config'

/**
 * Health check endpoint
 */
const getRoot: RequestHandler = (req, res) => {
    res.status(200).json({
        name: config.name,
        description: config.description,
        version: config.version,
        //todo: extrac dynamic routes from express router
        routes: ["/", "/netatmo", "/apistatus", "/stationsdata", "/sunshinenext6hours", "/thunderstormwarning", "/test",
            "/testNetatmoToLametric", "/testMeteoDataToLaMetric", "/testmeteoDataForParticle", "/testSolarPowerDataForParticle"]
    });
}

export default getRoot