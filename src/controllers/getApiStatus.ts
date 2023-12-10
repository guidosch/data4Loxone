import { RequestHandler } from 'express'
import { MeteoOpenData } from '../types/meteoOpenData'
import { MeteoOpenDataAPIStatus } from '../types/metoDataApiStatus'
import axios from 'axios';
import moment from 'moment';
import e from 'cors';

const MAX_DATA_AGE = 25 * 60 * 1000; // 25 minutes
const SMA_URL = process.env["SMA_OPENDATA_URL"] || "url not set";

/**
 * Health check endpoint which checks whether meteo data is not too old.
 * 
 */
const getRoot: RequestHandler = (req, res) => {

  axios.get<MeteoOpenData>(SMA_URL).then(function (response) {
    if (response.status == 200) {
      let data: MeteoOpenData = response.data;
      let result = <MeteoOpenDataAPIStatus>{};
      result.apiDataUptoDateAsBoolean = false;
      result.apiDataUptoDate = 0;
      result.apiAvailableStatus = 1;
      let diff = moment().diff(moment(data.dateTime));
      if (diff < MAX_DATA_AGE) {
        result.apiDataUptoDateAsBoolean = true;
        result.apiDataUptoDate = 1;
      }
      result.apiDataAgeInMinutes = Math.round(diff / 1000 / 60);
      res.status(200).json(result);
    } else {
      let status = parseInt(response.status.toString());
      if (status > 200) {
        res.status(response.status).json({ error: "Error getting data from local SMA service: " + SMA_URL });
      } else {
        res.status(500).json({ error: "Error 500er getting data from local SMA service: " + SMA_URL });
      }
      console.log("Error getting data from local SMA service: " + SMA_URL + " status: " + status);
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
    console.log(error.toJSON());
  });

}

export default getRoot
