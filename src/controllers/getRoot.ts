import { RequestHandler } from 'express'
import config from '../config'
import app from '../app'

/**
 * Overview of all available routes
 */


const getRoot: RequestHandler = (req, res) => {

    let routes: string[] = [];
    let htmlout: string = '';
    let host = req.get('host');
    
    app._router.stack.forEach(function (r: any) {
        if (r.name === 'router' && r.handle.stack) {
            r.handle.stack.forEach(function (s: any) {
                routes.push(`http://${host}${s.route.path}`);
            })
        }
    })

    routes.forEach((route: string) => {
        htmlout += `<li><a href="${route}">${route}</a></li>`;
    });

    res.status(200).send(
        `<html><body><h3>${config.name}</h3><p>${config.description}</p><ul>${htmlout}</ul></body></html>`
    ).contentType('text/html');

}

export default getRoot
