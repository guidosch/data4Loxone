export interface NetatmoStationsData {
    temperatureMain: number;
    co2Main: number;
    humidityMain: number;
    temperatureRoom: number;
    co2Room: number;
    humidityRoom: number;
    temperatureOutside: number;
    humidityOutside: number;
    lastUpdateSecondsAgo: number;
    error: string;
}

export const emtpyNetatmoStationsData: NetatmoStationsData = {
    temperatureMain: 0,
    co2Main: 0,
    humidityMain: 0,
    temperatureRoom: 0,
    co2Room: 0,
    humidityRoom: 0,
    temperatureOutside: 0,
    humidityOutside: 0,
    lastUpdateSecondsAgo: 0,
    error: ""

};
