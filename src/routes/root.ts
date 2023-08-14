import express from 'express'
import getRoot from '../controllers/getRoot'
import getNetatmo from '../controllers/getNetatmo'
import getApiStatus from '../controllers/getApiStatus'
import getNetatmoModulesHealth from '../controllers/getNetatmoModulesHealth'
import getSunshineNext6Hours from '../controllers/getSunshineNext6Hours'
import getThunderstormWarning from '../controllers/getThunderstormWarning'
import getTest from '../controllers/getTest'

const root = express.Router()

root.get('/', getRoot)
root.get('/netatmo', getNetatmo)
root.get('/apistatus', getApiStatus)
root.get('/stationsdata', getNetatmoModulesHealth)
root.get('/sunshinenext6hours', getSunshineNext6Hours)
root.get('/thunderstormwarning', getThunderstormWarning)
root.get('/test', getTest)

export default root
