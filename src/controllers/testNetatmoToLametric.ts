import { RequestHandler } from 'express'
import { LametricHandler } from '../staticHandlers/lametricHandler';

const getRoot: RequestHandler = (req, res) => {
    LametricHandler.sendNetatmoToLaMetric();
    res.status(200).json({
        name: "LametricHandler.sendNetatmoToLaMetric() called"
    });
}

export default getRoot
