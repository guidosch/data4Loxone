export interface ParticleEvent {
    name: string;
    data: string;
    private: boolean;
    ttl: number;
}

export const particleEvent = (): ParticleEvent => ({
    name: "hasUnusedSolarPower",
    data: "false",
    private: true,
    ttl: 60
});
