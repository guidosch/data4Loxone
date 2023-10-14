import axios, { AxiosResponse } from "axios";
import ParticleAxiosIntercepter from '../logic/particleRequestResponseInterceptor';
import { ParticleEvent, particleEvent } from "../types/particleEvent";
import { Solaredge } from "../types/solaredge";

// solaredge config
const API_KEY = process.env["API_KEY_SOLAREDGE"] //see 1password for user
const SITE = 2801781;

//particle config
const particle_username = process.env["PARTICLE_USERNAME"]
const particle_password = process.env["PARTICLE_PASSWORD"]
let particle_auth_token = "";

//create a new default particle event
const particleEventDefault = particleEvent();

const axiosInstance = axios.create({
    baseURL: 'https://monitoringapi.solaredge.com',
    timeout: 5000,
    headers: {
        "Cache-Control": "max-age=0",
        "Accept": "application/json",
    },

});


const particleHttpClient = new ParticleAxiosIntercepter();

interface ParticleResponse {
    body: {
        ok: boolean;
    };
}


export class SolarEdgeToParticleHandler {




    static async meteoDataForParticle() {
        throw new Error('Method not implemented.');

    }


    static async solarPowerDataForParticle() {

        //get data from solaredge
        axiosInstance.get(`/site/${SITE}/currentPowerFlow?api_key=${API_KEY}`).then(function (response) {
            if (response.status == 200) {
                let hasSolarPower = SolarEdgeToParticleHandler.hasUnusedSolasPower(response.data);
                particleEventDefault.data = hasSolarPower.toString();


                /** example event
                 * curl https://api.particle.io/v1/devices/events \
                -d "name=myevent" \
                -d "data=Hello World" \
                -d "private=true" \
                -d "ttl=60" \
                -d "access_token=1234"
                 */

                particleHttpClient.post('/v1/devices/events', particleEventDefault)

                    .then(function (response: AxiosResponse): void {
                        console.log(`response from particle.: ${JSON.stringify(response.data)}`);
                    })
                    .catch(function (error: any) {
                        console.log("Error sending data to particle: " + JSON.stringify(error));
                    });

                /** 
                particle.login({ username: particle_username, password: particle_password }).then(
                    function (data) {
                        particle_auth_token = data.body.access_token;
                        var publishEventPr = particle.publishEvent({
                            name: particleEventName, data: hasSolarPower, auth: particle_auth_token
                        });
            
                        publishEventPr.then(
                            function (data) {
                                if (data.body.ok) { console.log("Event: published succesfully"); }
                            },
                            function (err) {
                                console.log("Failed to publish event:" + err);
                            }
                        );
            
                    },
                    function (err) {
                        console.log("Could not log in.", err);
                    }
                );
                */

            }
        }).catch(function (error) {
            console.log("Error requesting data from solaredge: " + JSON.stringify(error));
        });
    }

    private static hasUnusedSolasPower(solaredgeData: Solaredge): boolean {

        /** example data
         * 
         * {
            "siteCurrentPowerFlow": {
                "updateRefreshRate": 3,
                "unit": "kW",
                "connections": [
                    {
                        "from": "GRID",
                        "to": "Load"
                    }
                ],
                "GRID": {
                    "status": "Active",
                    "currentPower": 16.19
                },
                "LOAD": {
                    "status": "Active",
                    "currentPower": 16.19
                },
                "PV": {
                    "status": "Idle",
                    "currentPower": 0
                }
            }
        }
         */


        console.log(JSON.stringify(solaredgeData));
        let connections = solaredgeData.siteCurrentPowerFlow.connections;
        let powerCount = 0;
        if (solaredgeData.siteCurrentPowerFlow.PV.status.match(/active/i)) {
            connections.forEach(connection => {
                if (connection.from.match(/pv/i) && connection.to.match(/load/i)) {
                    powerCount++;
                }
                if (connection.from.match(/load/i) && connection.to.match(/grid/i)) {
                    powerCount++;
                }
            });
        }
        if (powerCount == 2) {
            return true;
        }
        return false;
    }

}
