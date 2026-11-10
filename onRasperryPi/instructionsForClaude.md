Create a bash script that I can run on a raspberry pi that checks the logs of all the running docker containers

You can find the log via the docker inspect command

this is the output of the:
sudo docker ps command

`
CONTAINER ID   IMAGE                           COMMAND                  CREATED        STATUS       PORTS                                                           NAMES
9dc867ebc065   rain-radar                      "uvicorn app:app --h…"   2 months ago   Up 6 weeks   0.0.0.0:8022->8022/tcp, :::8022->8022/tcp                       rain-radar
4216d64257bb   guidosch/node-app-data4loxone   "docker-entrypoint.s…"   8 months ago   Up 3 hours   0.0.0.0:8081->8000/tcp, :::8081->8000/tcp                       data4loxone
a3e41732cb47   marcelstoer/open-data-smn       "/usr/local/s2i/run"     3 years ago    Up 6 weeks   8443/tcp, 0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 8778/tcp   open-data-smn
`

The script should run once every day and check the logs of the last 24h and search for errors. I will provide you with some logs.

If you find an error send it to:

curl -d "message comes here" https://ntfy.sh/raspi-notications-f8ba49cf-ff12-4de5-9652

As a short msg. with the container name.

also show me the crontab command to run the script

some Logs:

{"log":"GET /sunshinenext6hours 200 - - 64.186 ms\n","stream":"stdout","time":"2026-03-05T22:17:39.114448612Z"}
{"log":"openweathermap request: /thunderstormwarning\n","stream":"stdout","time":"2026-03-05T22:17:39.162480398Z"}
{"log":"GET /thunderstormwarning 200 - - 47.514 ms\n","stream":"stdout","time":"2026-03-05T22:17:39.210596721Z"}
{"log":"Sending to lametric: {\"icon_type\":\"none\",\"model\":{\"frames\":[{\"icon\":\"i2355\",\"text\":\"6.50°C Out\"},{\"icon\":\"i9095\",\"text\":\"6.5/11.9km/h\"}],\"cycles\":2
}}\n","stream":"stdout","time":"2026-03-05T22:17:40.024836941Z"}
{"log":"Lametric accepted data\n","stream":"stdout","time":"2026-03-05T22:17:40.099113218Z"}
{"log":"GET /apistatus 200 101 - 16.084 ms\n","stream":"stdout","time":"2026-03-05T22:18:08.100194574Z"}
{"log":"GET /netatmo 200 202 - 104.080 ms\n","stream":"stdout","time":"2026-03-05T22:18:15.395236945Z"}
{"log":"Sending to lametric: {\"icon_type\":\"none\",\"model\":{\"frames\":[{\"icon\":\"i2355\",\"text\":\"24.7°C In\"},{\"icon\":\"i12785\",\"text\":841},{\"icon\":\"i3359\",\"text
\":\"37%\"}],\"cycles\":2}}\n","stream":"stdout","time":"2026-03-05T22:18:30.159002093Z"}
{"log":"Lametric accepted data\n","stream":"stdout","time":"2026-03-05T22:18:30.22593348Z"}
{"log":"Sending to lametric: {\"icon_type\":\"none\",\"model\":{\"frames\":[{\"icon\":\"i2355\",\"text\":\"6.50°C Out\"},{\"icon\":\"i9095\",\"text\":\"6.5/11.9km/h\"}],\"cycles\":2
}}\n","stream":"stdout","time":"2026-03-05T22:18:40.037216172Z"}
{"log":"Lametric accepted data\n","stream":"stdout","time":"2026-03-05T22:18:40.104115523Z"}
{"log":"GET /netatmo 200 203 - 119.859 ms\n","stream":"stdout","time":"2026-03-05T22:19:15.56645659Z"}
{"log":"Error: {\"message\":\"connect ENETUNREACH 13.107.213.60:443\",\"name\":\"Error\",\"stack\":\"Error: connect ENETUNREACH 13.107.213.60:443\\n    at AxiosError.from (/usr/app/
node_modules/axios/dist/node/axios.cjs:836:14)\\n    at RedirectableRequest.handleRequestError (/usr/app/node_modules/axios/dist/node/axios.cjs:3010:25)\\n    at RedirectableRequest
.emit (node:events:517:28)\\n    at eventHandlers.\u003ccomputed\u003e (/usr/app/node_modules/follow-redirects/index.js:14:24)\\n    at ClientRequest.emit (node:events:517:28)\\n   
 at TLSSocket.socketErrorListener (node:_http_client:501:9)\\n    at TLSSocket.emit (node:events:517:28)\\n    at emitErrorNT (node:internal/streams/destroy:151:8)\\n    at emitErrorCloseNT (node:internal/streams/destroy:116:3)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)\",\"config\":{\"transitional\":{\"silentJSONParsing\":true,\"forcedJSONParsing\":true,\"clarifyTimeoutError\":false},\"adapter\":[\"xhr\",\"http\"],\"transformRequest\":[null],\"transformResponse\":[null],\"timeout\":0,\"xsrfCookieName\":\"XSRF-TOKEN\",\"xsrfHeaderName\":\"X-XSRF-TOKEN\",\"maxContentLength\":-1,\"maxBodyLength\":-1,\"env\":{},\"headers\":{\"Accept\":\"application/json, text/plain, */*\",\"Authorization\":\"Bearer 51e187271877599ca6000055|10bdcec31ddb9a674991641acbdd5c97\",\"User-Agent\":\"axios/1.4.0\",\"Accept-Encoding\":\"gzip, compress, deflate, br\"},\"baseURL\":\"https://api.netatmo.com/\",\"params\":{\"device_id\":\"70:ee:50:bd:0d:0a\",\"scale\":\"max\",\"type\":[\"Temperature\",\"CO2\",\"Humidity\"],\"date_end\":\"last\",\"optimize\":true},\"method\":\"get\",\"url\":\"api/getstationsdata\"},\"code\":\"ENETUNREACH\",\"status\":null}\n","stream":"stderr","time":"2026-03-05T22:19:30.052436301Z"}
{"log":"\n","stream":"stderr","time":"2026-03-05T22:19:30.05498682Z"}
{"log":"node:internal/process/promises:288\n","stream":"stderr","time":"2026-03-05T22:19:30.055103596Z"}
{"log":"            triggerUncaughtException(err, true /* fromPromise */);\n","stream":"stderr","time":"2026-03-05T22:19:30.055136503Z"}
{"log":"            ^\n","stream":"stderr","time":"2026-03-05T22:19:30.055166021Z"}
{"log":"AxiosError: connect ENETUNREACH 13.107.213.60:443\n","stream":"stderr","time":"2026-03-05T22:19:30.108583031Z"}
{"log":"    at AxiosError.from (/usr/app/node_modules/axios/dist/node/axios.cjs:836:14)\n","stream":"stderr","time":"2026-03-05T22:19:30.10881075Z"}
{"log":"    at RedirectableRequest.handleRequestError (/usr/app/node_modules/axios/dist/node/axios.cjs:3010:25)\n","stream":"stderr","time":"2026-03-05T22:19:30.108861916Z"}
{"log":"    at RedirectableRequest.emit (node:events:517:28)\n","stream":"stderr","time":"2026-03-05T22:19:30.108891601Z"}
{"log":"    at eventHandlers.\u003ccomputed\u003e (/usr/app/node_modules/follow-redirects/index.js:14:24)\n","stream":"stderr","time":"2026-03-05T22:19:30.108919434Z"}
{"log":"    at ClientRequest.emit (node:events:517:28)\n","stream":"stderr","time":"2026-03-05T22:19:30.108949637Z"}
{"log":"    at TLSSocket.socketErrorListener (node:_http_client:501:9)\n","stream":"stderr","time":"2026-03-05T22:19:30.108977729Z"}
{"log":"    at TLSSocket.emit (node:events:517:28)\n","stream":"stderr","time":"2026-03-05T22:19:30.109006544Z"}
{"log":"    at emitErrorNT (node:internal/streams/destroy:151:8)\n","stream":"stderr","time":"2026-03-05T22:19:30.109034006Z"}
{"log":"    at emitErrorCloseNT (node:internal/streams/destroy:116:3)\n","stream":"stderr","time":"2026-03-05T22:19:30.109061691Z"}
{"log":"    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {\n","stream":"stderr","time":"2026-03-05T22:19:30.109152282Z"}
{"log":"  port: 443,\n","stream":"stderr","time":"2026-03-05T22:19:30.109184449Z"}
{"log":"  address: '13.107.213.60',\n","stream":"stderr","time":"2026-03-05T22:19:30.109212393Z"}
{"log":"  syscall: 'connect',\n","stream":"stderr","time":"2026-03-05T22:19:30.109239633Z"}
{"log":"  code: 'ENETUNREACH',\n","stream":"stderr","time":"2026-03-05T22:19:30.109266596Z"}
{"log":"  errno: -101,\n","stream":"stderr","time":"2026-03-05T22:19:30.109294725Z"}
{"log":"  config: {\n","stream":"stderr","time":"2026-03-05T22:19:30.109322206Z"}
{"log":"    transitional: {\n","stream":"stderr","time":"2026-03-05T22:19:30.109497259Z"}
{"log":"      silentJSONParsing: true,\n","stream":"stderr","time":"2026-03-05T22:19:30.109541388Z"}
{"log":"      forcedJSONParsing: true,\n","stream":"stderr","time":"2026-03-05T22:19:30.109569758Z"}
{"log":"      clarifyTimeoutError: false\n","stream":"stderr","time":"2026-03-05T22:19:30.10959698Z"}
{"log":"    },\n","stream":"stderr","time":"2026-03-05T22:19:30.10962409Z"}
{"log":"    adapter: [ 'xhr', 'http' ],\n","stream":"stderr","time":"2026-03-05T22:19:30.109650553Z"}
{"log":"    transformRequest: [ [Function: transformRequest] ],\n","stream":"stderr","time":"2026-03-05T22:19:30.109678553Z"}
{"log":"    transformResponse: [ [Function: transformResponse] ],\n","stream":"stderr","time":"2026-03-05T22:19:30.109706478Z"}
{"log":"    timeout: 0,\n","stream":"stderr","time":"2026-03-05T22:19:30.109733422Z"}
{"log":"    xsrfCookieName: 'XSRF-TOKEN',\n","stream":"stderr","time":"2026-03-05T22:19:30.109760107Z"}
{"log":"    xsrfHeaderName: 'X-XSRF-TOKEN',\n","stream":"stderr","time":"2026-03-05T22:19:30.109786588Z"}
{"log":"    maxContentLength: -1,\n","stream":"stderr","time":"2026-03-05T22:19:30.109813384Z"}
{"log":"    maxBodyLength: -1,\n","stream":"stderr","time":"2026-03-05T22:19:30.109840421Z"}
{"log":"    env: {\n","stream":"stderr","time":"2026-03-05T22:19:30.109867217Z"}

----------

{"log":"INFO:     Started server process [1]\n","stream":"stderr","time":"2026-08-27T21:16:50.697392617Z"}
{"log":"INFO:     Waiting for application startup.\n","stream":"stderr","time":"2026-08-27T21:16:50.697532281Z"}
{"log":"INFO:     Application startup complete.\n","stream":"stderr","time":"2026-08-27T21:16:50.698278179Z"}
{"log":"INFO:     Uvicorn running on http://0.0.0.0:8022 (Press CTRL+C to quit)\n","stream":"stderr","time":"2026-08-27T21:16:50.703827621Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-27T21:17:54', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-08-27T21:17:54.723054476Z"}
{"log":"INFO:     192.168.2.84:54922 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-27T21:17:54.724825822Z"}
{"log":"INFO:     192.168.2.84:54922 - \"GET /favicon.ico HTTP/1.1\" 404 Not Found\n","stream":"stdout","time":"2026-08-27T21:17:54.752355888Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T05:45:38', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-08-28T05:45:38.628568258Z"}
{"log":"INFO:     192.168.2.84:56253 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T05:45:38.630321715Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T07:56:56', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-08-28T07:56:56.975638259Z"}
{"log":"INFO:     192.168.2.84:57755 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T07:56:56.976643967Z"}
{"log":"INFO:     192.168.2.84:57937 - \"GET /radar.png HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T08:01:46.410766034Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T08:03:04', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-08-28T08:03:04.364404756Z"}
{"log":"INFO:     192.168.2.84:57938 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T08:03:04.365545111Z"}
{"log":"INFO:     192.168.2.84:57995 - \"GET /radar.png HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T08:07:12.930338967Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T08:09:37', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.06609375, 'level': 'nearby', 'message': 'some intense echoes nearby'}\n","stream":"stdout","time":"2026-08-28T08:09:37.642534331Z"}
{"log":"INFO:     192.168.2.84:58017 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T08:09:37.643329394Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T10:28:42', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-08-28T10:28:42.822309159Z"}
{"log":"INFO:     192.168.2.84:60026 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T10:28:42.824076782Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-08-28T11:21:32', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0028125, 'level': 'nearby', 'message': 'some intense echoes nearby'}\n","stream":"stdout","time":"2026-08-28T11:21:32.973910722Z"}
{"log":"INFO:     192.168.2.84:60570 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-08-28T11:21:32.974623009Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-09-08T19:55:10', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-09-08T19:55:10.727124584Z"}
{"log":"INFO:     192.168.2.84:51099 - \"GET /check HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-09-08T19:55:10.730865735Z"}
{"log":"INFO:     192.168.2.84:51099 - \"GET /favicon.ico HTTP/1.1\" 404 Not Found\n","stream":"stdout","time":"2026-09-08T19:55:10.762922287Z"}
{"log":"/check x=1344 y=1019 radius=40 -\u003e {'timestamp': '2026-09-08T20:03:11', 'target_xy': [1344, 1019], 'radius_px': 40, 'intense_fraction': 0.0, 'level': 'clear', 'message': 'clear (no red/orange at that spot)'}\n","stream":"stdout","time":"2026-09-08T20:03:11.576888034Z"}
{"log":"INFO:     192.168.2.84:51132 - \"GET /check?x=1344\u0026y=1019\u0026radius=40 HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-09-08T20:03:11.579141965Z"}
{"log":"/check x=1344 y=1019 radius=60 -\u003e {'timestamp': '2026-09-08T20:05:14', 'target_xy': [1344, 1019], 'radius_px': 60, 'intense_fraction': 0.04881944444444444, 'level': 'nearby', 'message': 'some intense echoes nearby'}\n","stream":"stdout","time":"2026-09-08T20:05:14.947089248Z"}
{"log":"INFO:     192.168.2.84:51146 - \"GET /check?x=1344\u0026y=1019\u0026radius=60 HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-09-08T20:05:14.947930126Z"}
{"log":"/check x=1344 y=1019 radius=60 -\u003e {'timestamp': '2026-09-08T20:09:24', 'target_xy': [1344, 1019], 'radius_px': 60, 'intense_fraction': 0.09659722222222222, 'level': 'nearby', 'message': 'some intense echoes nearby'}\n","stream":"stdout","time":"2026-09-08T20:09:24.211093937Z"}
{"log":"INFO:     192.168.2.84:51226 - \"GET /check?x=1344\u0026y=1019\u0026radius=60 HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-09-08T20:09:24.211748706Z"}
{"log":"/check x=1344 y=1019 radius=60 -\u003e {'timestamp': '2026-09-08T20:12:20', 'target_xy': [1344, 1019], 'radius_px': 60, 'intense_fraction': 0.09659722222222222, 'level': 'nearby', 'message': 'some intense echoes nearby'}\n","stream":"stdout","time":"2026-09-08T20:12:20.255250696Z"}
{"log":"INFO:     192.168.2.84:51237 - \"GET /check?x=1344\u0026y=1019\u0026radius=60 HTTP/1.1\" 200 OK\n","stream":"stdout","time":"2026-09-08T20:12:20.256513031Z"}
{"log":"INFO:     Started server process [1]\n","stream":"stderr","time":"2026-09-24T12:31:42.761276151Z"}
{"log":"INFO:     Waiting for application startup.\n","stream":"stderr","time":"2026-09-24T12:31:42.762722966Z"}
{"log":"INFO:     Application startup complete.\n","stream":"stderr","time":"2026-09-24T12:31:42.762774966Z"}
{"log":"INFO:     Uvicorn running on http://0.0.0.0:8022 (Press CTRL+C to quit)\n","stream":"stderr","time":"2026-09-24T12:31:42.7746623Z"}

----
{"log":"2023-11-14 18:02:40,024 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:02:40.025231666Z"}
{"log":"2023-11-14 18:02:40,060 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16329 bytes\n","stream":"stdout","time":"2023-11-14T18:02:40.060980744Z"}
{"log":"2023-11-14 18:02:40,063 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:02:40.063643978Z"}
{"log":"2023-11-14 18:09:26,635 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:09:26.636099471Z"}
{"log":"2023-11-14 18:09:26,670 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16329 bytes\n","stream":"stdout","time":"2023-11-14T18:09:26.67091099Z"}
{"log":"2023-11-14 18:09:26,673 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:09:26.673737166Z"}
{"log":"2023-11-14 18:14:40,028 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:14:40.029407129Z"}
{"log":"2023-11-14 18:14:40,063 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16320 bytes\n","stream":"stdout","time":"2023-11-14T18:14:40.064065391Z"}
{"log":"2023-11-14 18:14:40,066 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:14:40.066692163Z"}
{"log":"2023-11-14 18:20:40,031 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:20:40.032207858Z"}
{"log":"2023-11-14 18:20:40,082 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16336 bytes\n","stream":"stdout","time":"2023-11-14T18:20:40.083498013Z"}
{"log":"2023-11-14 18:20:40,086 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:20:40.086780663Z"}
{"log":"2023-11-14 18:26:11,761 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:26:11.761924917Z"}
{"log":"2023-11-14 18:26:11,798 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16336 bytes\n","stream":"stdout","time":"2023-11-14T18:26:11.799828909Z"}
{"log":"2023-11-14 18:26:11,802 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:26:11.80300619Z"}
{"log":"2023-11-14 18:32:11,853 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:32:11.854007399Z"}
{"log":"2023-11-14 18:32:11,909 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16338 bytes\n","stream":"stdout","time":"2023-11-14T18:32:11.910324476Z"}
{"log":"2023-11-14 18:32:11,914 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:32:11.915055232Z"}
{"log":"2023-11-14 18:37:27,135 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:37:27.136338755Z"}
{"log":"2023-11-14 18:37:27,180 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16338 bytes\n","stream":"stdout","time":"2023-11-14T18:37:27.18159892Z"}
{"log":"2023-11-14 18:37:27,184 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:37:27.185231045Z"}
{"log":"2023-11-14 18:42:40,029 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:42:40.030330476Z"}
{"log":"2023-11-14 18:42:40,062 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16290 bytes\n","stream":"stdout","time":"2023-11-14T18:42:40.0631874Z"}
{"log":"2023-11-14 18:42:40,069 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:42:40.069800217Z"}
{"log":"2023-11-14 18:47:51,990 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:47:51.991479114Z"}
{"log":"2023-11-14 18:47:52,032 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16290 bytes\n","stream":"stdout","time":"2023-11-14T18:47:52.032830341Z"}
{"log":"2023-11-14 18:47:52,036 WARN  [com.fri.smn.StationMap] (executor-thread-22) No station meta-data available for 'PFA'.\n","stream":"stdout","time":"2023-11-14T18:47:52.037151196Z"}
{"log":"2023-11-14 18:53:27,455 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Loading data from source\n","stream":"stdout","time":"2023-11-14T18:53:27.456310634Z"}
{"log":"2023-11-14 18:53:27,489 INFO  [com.fri.smn.cor.GeoAdmin] (executor-thread-22) Successfully fetched 16292 bytes\n","stream":"stdout","time":"2023-11-14T18:53:27.490518238Z"}
{"log":"2
