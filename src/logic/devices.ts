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
    //device_id: "70:ee:50:01:97:20", old one
    device_id: "70:ee:50:bd:0d:0a",
    scale: "max",
    type: [MeasturmentType.Temperature, MeasturmentType.CO2, MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};

export var optionsModuleRoom: NetatmoDevice = {
    //room module
    device_id: "70:ee:50:bd:0d:0a",
    module_id: "03:00:00:10:90:18",
    scale: "max",
    type: [MeasturmentType.Temperature, MeasturmentType.CO2, MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};

export var optionsModuleOutside: NetatmoDevice = {
    //outside module
    device_id: "70:ee:50:bd:0d:0a",
    module_id: "02:00:00:bc:e9:da",
    scale: "max",
    type: [MeasturmentType.Temperature,  MeasturmentType.Humidity],
    date_end: "last",
    optimize: true
};
