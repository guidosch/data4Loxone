import express from 'express'
import getRoot from '../controllers/getRoot'
import getNetatmo from '../controllers/getNetatmo'
import getApiStatus from '../controllers/getApiStatus'
import getNetatmoModulesHealth from '../controllers/getNetatmoModulesHealth'
import getOpenweathermapData from '../controllers/getOpenweathermapData'
import getTest from '../controllers/getTest'

const root = express.Router()

root.get('/', getRoot)

// call to netato api to get temperature, humidity and co2
root.get('/netatmo', getNetatmo)

// call to my local OpenData smn/SMA to check if api is up and data is not too old
root.get('/apistatus', getApiStatus)

// call to netato api to ask for modules health
root.get('/stationsdata', getNetatmoModulesHealth)

// call to external service with weather forecast
root.get('/sunshinenext6hours', getOpenweathermapData)
root.get('/thunderstormwarning', getOpenweathermapData)

//not in use yet
root.get('/test', getTest)

export default root
