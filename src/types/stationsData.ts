export interface Stationsdata {
    _id:               string;
    station_name:      string;
    date_setup:        number;
    last_setup:        number;
    type:              string;
    last_status_store: number;
    module_name:       string;
    firmware:          number;
    last_upgrade:      number;
    wifi_status:       number;
    reachable:         boolean;
    co2_calibrating:   boolean;
    data_type:         string[];
    place:             Place;
    home_id:           string;
    home_name:         string;
    dashboard_data:    StationsdataDashboardData;
    modules:           Module[];
}

export interface StationsdataDashboardData {
    time_utc:         number;
    Temperature:      number;
    CO2:              number;
    Humidity:         number;
    Noise:            number;
    Pressure:         number;
    AbsolutePressure: number;
    min_temp:         number;
    max_temp:         number;
    date_max_temp:    number;
    date_min_temp:    number;
    temp_trend:       string;
    pressure_trend:   string;
}

export interface Module {
    _id:             string;
    type:            string;
    module_name:     string;
    last_setup:      number;
    data_type:       string[];
    battery_percent: number;
    reachable:       boolean;
    firmware:        number;
    last_message:    number;
    last_seen:       number;
    rf_status:       number;
    battery_vp:      number;
    dashboard_data?: ModuleDashboardData;
}

export interface ModuleDashboardData {
    time_utc:      number;
    Temperature:   number;
    CO2:           number;
    Humidity:      number;
    min_temp:      number;
    max_temp:      number;
    date_max_temp: number;
    date_min_temp: number;
    temp_trend:    string;
}

export interface Place {
    altitude: number;
    city:     string;
    country:  string;
    timezone: string;
    location: number[];
}
