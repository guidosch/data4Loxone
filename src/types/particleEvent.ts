export interface ParticleEvent {
    name: string;
    data: string;
    private: boolean;
    ttl: number;
}

export var particleEventSolarPower = (): ParticleEvent => ({
    name: "hasUnusedSolarPower",
    data: "false",
    private: true,
    ttl: 60
});

export var particleEventMeteoData = (): ParticleEvent => ({
    name: "meteodata",
    data: "",
    private: true,
    ttl: 60
});
