import { RequestHandler } from 'express'
import { MeteoOpenData } from '../types/meteoOpenData'
import { MeteoOpenDataAPIStatus } from '../types/metoDataApiStatus'
import axios from 'axios';
import moment from 'moment';

const MAX_DATA_AGE = 25 * 60 * 1000;
/**
 * Health check endpoint
 */
const getRoot: RequestHandler = (req, res) => {

    axios.get<MeteoOpenData>('http://192.168.2.40:4712/smn/SMA').then(function (response) {
        if (response.status == 200) {
            let data: MeteoOpenData = response.data;
            let result = <MeteoOpenDataAPIStatus>{};
            result.apiDataUptoDateAsBoolean = true;
            let diff = moment().diff(moment(data.dateTime));
                    if (diff < MAX_DATA_AGE) {
                        result.apiDataUptoDateAsBoolean = true;
                        result.apiDataUptoDate = 1;
                    }
                    result.apiDataAgeInMinutes = Math.round(diff / 1000 / 60);
            res.status(200).json(result);
        }
    }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log(error.config);
    });
   
}

export default getRoot
