import { RequestHandler } from 'express'
import config from '../config'

/**
 * Health check endpoint
 */
const getRoot: RequestHandler = (req, res) => {
    res.status(200).json({
        name: "sunshinenext6hours"
    });
}

export default getRoot
