import { RequestHandler } from 'express'
import https from 'https';

const cityId = 2657896;
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

interface Result {
    type: string;
}

interface SunshineResult extends Result {
    sunshine: number;
}
interface ThunderstormResult extends Result {
    thunderstorm: number;
}

const result: Result = {
    type: "error"
};

/**
 * get data from openweathermap.org for Zürich
 */
const getRoot: RequestHandler = (req, res) => {
    let type: string = "";
    console.log("openweathermap request: " + req.url);
    if (req.url === "/sunshinenext6hours") {
        type = "sun";
    } else if (req.url === "/thunderstormwarning") {
        type = "thunderstorm";
    }

    https.get("https://api.openweathermap.org/data/2.5/forecast?id=" + cityId + "&appid=" + apiKey, (resp) => {
        var data = "";
        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
            data += chunk;
        });
        resp.on("end", () => {
            const weather = JSON.parse(data);
            var weatherId = 0;
            switch (type) {
                case "sun":
                    let sunshineResult: SunshineResult = {
                        type: "sun",
                        sunshine: 0
                    };
                    if (weather.cnt > 2) { //number of lines returned
                        //the sun shines only on daytime --> "d"
                        const hours3 = weather.list[0].sys.pod === "d";
                        const hours6 = weather.list[1].sys.pod === "d";
                        if (hours3 || hours6) {
                            for (var i = 0; i < 2; i++) {
                                weatherId = weather.list[i].weather[0].id;
                                //weather cond. ids: https://openweathermap.org/weather-conditions
                                if (weatherId >= 800 && weatherId <= 803) {
                                    sunshineResult.sunshine = 1;
                                }
                            }
                        }
                    }
                    res.end(JSON.stringify(sunshineResult));
                    break;

                case "thunderstorm":
                    let thunderstormResult: ThunderstormResult = {
                        type: "thunderstorm",
                        thunderstorm: 0
                    };
                    if (weather.cnt > 1) {
                        weatherId = weather.list[0].weather[0].id;
                        //weather cond. ids: https://openweathermap.org/weather-conditions
                        if (weatherId >= 200 && weatherId < 232) {
                            thunderstormResult.thunderstorm = 1;
                        }
                    }
                    res.end(JSON.stringify(thunderstormResult));
                    break;
                default:
                    res.end(JSON.stringify(result));
                    break;
            }

        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
        res.end(JSON.stringify(result));
    });


}

export default getRoot
