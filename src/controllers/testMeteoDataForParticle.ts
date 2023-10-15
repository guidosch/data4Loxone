import { RequestHandler } from 'express'
import { ParticleHandler } from '../staticHandlers/particleHandler';

const getRoot: RequestHandler = (req, res) => {
    ParticleHandler.meteoDataForParticle();
    res.status(200).json({
        name: "ParticleHandler.meteoDataForParticle() called"
    });
}

export default getRoot

