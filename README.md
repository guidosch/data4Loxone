# Data4Loxone

Gather data from different sources and serve on HTTP endpoint for Loxone and push also to Particle Cloud and LametricTime display.

## Usage:

You should copy `.env.sample` to `.env` and then:

`npm run dev` - Run the development server.

`npm test` - Run tests.

`npm run test:watch` - Run tests when files update.

`npm run build` - Builds the server.

`npm start` - Runs the server.

## Default endpoints:

A `GET` request to `/` will respond with a description of the application.

## Config over .env
All config options are in the .env file. It will be loaded during runtime (by dotenv) package together with the `config.ts` file. The .env file will not be copied to the image for security reasons and you have to pass the variables over the docker run/create command. Also copy the files in the tokenStorage dir to the env where you run the container.

## Build the Docker image

Do it on the raspberry 4 to create a ARM 64 compatible image

`docker build . -t guidosch/node-app-data4loxone`

Create the new container (create command below...)

Stop running service and delete the old container before starting/creating the new one
sudo systemctl stop docker-data4loxone.service
sudo docker stop [containerID]
sudo docker ps -a to show all containers
sudo docker rm [containerID]
sudo docker rmi [imageID] to delete image
sudo systemctl start docker-data4loxone.service 

### Run the docker image

Copy the files from the tokenStorage of the running container before building the container!! Otherwise the data in the folder might be to old and has expired refresh tokens.
* authConf.json
* tokens.json
* tokensParticle.json


Mainly controlled over systemD script
`sudo systemctl [status/start/stop] docker-data4loxon`

Run in background (-d param). App inside container runs on port 8000
`sudo docker run --name=data4loxone -p 8081:8000 -d --env-file .env --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone`

Create container
`sudo docker craate --name=data4loxone -p 8081:8000 --env-file .env -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone`

Run and inspect container (Bash is not installed on alpine linux by default)
`sudo docker run --name=data4loxone -p 8081:8000 --env-file .env -it --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone /bin/sh --login`

### Monitoring
`sudo docker inspect [containerID] | grep log` to find the log path where all the console log is kept.
