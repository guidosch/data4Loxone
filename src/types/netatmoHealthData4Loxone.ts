export interface NetatmoStationsHealthData {
    mainModuleName: string;
    mainOnline: number;
    module1:string
    module1Online: number;
    module2:string
    module2Online: number;
    moduleOutdoorName:string;
    moduleOutdoorOnline: number;
}

export const emtpyNetatmoStationsHealthData = (): NetatmoStationsHealthData => ({
    mainModuleName: "roo",
    mainOnline: 0,
    module1: "zimmer1",
    module1Online: 0,
    module2: "zimmer2",
    module2Online: 0,
    moduleOutdoorName: "Outdoor",
    moduleOutdoorOnline: 0
});
