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
        //extrac dynamic routes from express router
        routes: ["/", "/netatmo", "/apistatus", "/stationsdata", "/sunshinenext6hours", "/thunderstormwarning" ]
    });
}

export default getRoot
