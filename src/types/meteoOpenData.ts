export interface MeteoOpenData {
    station:       Station;
    code:          string;
    dateTime:      Date;
    temperature:   string;
    sunshine:      string;
    precipitation: string;
    windDirection: string;
    windSpeed:     string;
    qnhPressure:   string;
    gustPeak:      string;
    humidity:      string;
    qfePressure:   string;
    qffPressure:   string;
}

export interface Station {
    code:      string;
    name:      string;
    ch1903Y:   number;
    ch1903X:   number;
    lat:       number;
    lng:       number;
    elevation: number;
}
