export interface NetatmoDevice {
    device_id: string;
    module_id?: string;
    scale: string;
    type: MeasturmentType[];
    date_end: string;
    optimize: boolean;
}

enum MeasturmentType {
    Temperature = "Temperature",
    CO2 = "CO2",
    Humidity = "Humidity"
}


export var MainStation: NetatmoDevice = {
    //main station
    device_id: "70:ee:50:01:97:20",
    scale: "max",
    type: [MeasturmentType.Temperature, MeasturmentType.CO2, MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};

export var optionsModuleRoom: NetatmoDevice = {
    //room module
    device_id: "70:ee:50:01:97:20",
    module_id: "03:00:00:06:37:cc",
    scale: "max",
    type: [MeasturmentType.Temperature, MeasturmentType.CO2, MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};

export var optionsModuleOutside: NetatmoDevice = {
    //outside module
    device_id: "70:ee:50:01:97:20",
    module_id: "02:00:00:01:94:24",
    scale: "max",
    type: [MeasturmentType.Temperature,  MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};
