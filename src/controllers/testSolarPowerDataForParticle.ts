import { RequestHandler } from 'express'
import { ParticleHandler } from '../staticHandlers/particleHandler';

const getRoot: RequestHandler = (req, res) => {
    ParticleHandler.solarPowerDataForParticle();
    res.status(200).json({
        name: "ParticleHandler.solarPowerDataForParticle() called"
    });
}

export default getRoot
