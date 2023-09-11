import axios from "axios";

// solaredge config
const API_KEY = process.env["API_KEY_SOLAREDGE"] //see 1password for user
const SITE = 2801781;

//particle config
const particleEventName = "hasUnusedSolarPower";
const particle_username = process.env["PARTICLE_USERNAME"]
const particle_password = process.env["PARTICLE_PASSWORD"]
let particle_auth_token = "";

const axiosInstance = axios.create({
    baseURL: 'https://monitoringapi.solaredge.com',
    timeout: 5000,
    headers: {
        "Cache-Control": "max-age=0"
    },

});


export class SolarEdgeToParticleHandler {

    static async solarPowerDataForParticle() {

        //get data from solaredge
        axiosInstance.get(`/site/${SITE}/currentPowerFlow?api_key=${API_KEY}`).then(function (response) {
            if (response.status == 200) {
                console.log(`response from solarEdge.: ${response.data}`);
                let hasSolarPower = SolarEdgeToParticleHandler.hasUnusedSolasPower(response.data);

                //publish to particle via particle API

                //todo replace with axios
                /**
                 * curl https://api.particle.io/oauth/token \
                        -u particle:particle \
                        -d grant_type=password \
                        -d "username=guido.schnider@gmail.com" \
                        -d "password=pk(dxE8iG3k6Vnx[GzrpiK"

                        response:
                        {"token_type":"bearer","access_token":"5a654cc5c50b8895b9782ffcc1b48aa0d2ea9057","expires_in":7776000,"refresh_token":"adf9cfeee53135d2a01a57ec9a7ba9e9522e1b65"}%
                 */
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

            }
        }).catch(function (error) {
            console.log("Error requesting data from solaredge: " + JSON.stringify(error));
        });
    }

    private static hasUnusedSolasPower(solaredgeData: any): boolean {
        //console.log(JSON.stringify(data));
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
