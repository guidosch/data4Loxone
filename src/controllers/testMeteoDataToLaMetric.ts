import { RequestHandler } from 'express'
import { LametricHandler } from '../staticHandlers/lametricHandler';

const getRoot: RequestHandler = (req, res) => {
    LametricHandler.sendMeteoDataToLaMetric();
    res.status(200).json({
        name: "LametricHandler.sendMeteoDataToLaMetric() called"
    });
}

export default getRoot