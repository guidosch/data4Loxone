import { RequestHandler } from 'express'
import AxiosInterceptor from '../logic/netatmo/netatmo2'
import { MainStation } from '../logic/netatmo/devices';

const axiosInterceptor = new AxiosInterceptor();
let config = {
    params: MainStation
}

const getRoot: RequestHandler = async (req, res) => {
    let response = await axiosInterceptor.get('api/getstationsdata', config)
    res.status(200).json(response.data
    );
}

export default getRoot
