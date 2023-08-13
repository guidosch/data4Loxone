export interface NetatmoStationsData {
    temperatureMain:      number;
    co2Main:              number;
    humidityMain:         number;
    temperatureRoom:      number;
    co2Room:              number;
    humidityRoom:         number;
    temperatureOutside:   number;
    humidityOutside:      number;
    lastUpdateSecondsAgo: number;
    error:                string;
}
