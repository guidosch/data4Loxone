import { RequestHandler } from 'express'
import config from '../config'
import app from '../app'

/**
 * Overview of all available routes
 */


const getRoot: RequestHandler = (req, res) => {

    let routes: string[] = [];
    let host = req.get('host');
    
    app._router.stack.forEach(function (r: any) {
        if (r.name === 'router' && r.handle.stack) {
            r.handle.stack.forEach(function (s: any) {
                console.log(s.route.path);
                routes.push(`http://${host}${s.route.path}`);
            })
        }
    })

    res.status(200).json({
        name: config.name,
        description: config.description,
        version: config.version,
        routes: routes
    });
}

export default getRoot
