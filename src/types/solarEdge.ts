export interface Solaredge {
    siteCurrentPowerFlow: SiteCurrentPowerFlow;
}

export interface SiteCurrentPowerFlow {
    updateRefreshRate: number;
    unit:              string;
    connections:       Connection[];
    GRID:              Grid;
    LOAD:              Grid;
    PV:                Grid;
}

export interface Grid {
    status:       string;
    currentPower: number;
}

export interface Connection {
    from: string;
    to:   string;
}
