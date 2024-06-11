# Data4Loxone

Gather data from different sources and serve over HTTP endpoint for Loxone home automation, push some data also to Particle Cloud and LametricTime display.

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
All config options are in the .env file. It will be loaded during runtime (by dotenv) package together with the `config.ts` file. The .env file will not be copied to the image for security reasons and you have to pass the variables over the docker `run/create` command. Also copy the files in the `tokenStorage` dir to the env where you run the container.

## Build and Deployment after code change

1. Update GIT repo on raspi
2. Copy recent tokens to files that are mounted to container
3. Stop service
4. Delete old container
5. Delete old image
6. Create new image
7. Create new contaner
8. Optional: Test new container
9. Start container via startscript

```bash
# Stop running service and delete the old container before starting/creating the new one
sudo systemctl stop docker-data4loxone.service
sudo docker stop [containerID]
sudo docker ps -a to show all containers
sudo docker rm [containerID]
sudo docker images
sudo docker rmi [imageID] to delete image
sudo docker create --name=data4loxone -p 8081:8000 --env-file .env -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone
sudo systemctl start docker-data4loxone.service
``````

Do it on the raspberry 4 to create a ARM 64 compatible image (-t is for the image name)

`docker build . -t guidosch/node-app-data4loxone`

Create the new container (create command below...) but copy the new refresh tokens before creating the container!

### Run/create the docker image

Copy the files from the tokenStorage of the running container before building the container!! Otherwise the data in the folder might be to old and has expired refresh tokens. The token files inside the container are at: /usr/app/dist/tokenStorage

* authConf.json
* tokens.json
* tokensParticle.json

### Debugging and Testing

Testing or just run without startscript: Run in background (-d param). App inside container runs on port 8000. Run for testing purposes

`sudo docker run --name=data4loxone -p 8081:8000 -d --env-file .env --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone`

Create the container (docker run does create and run in one command. Use create to start over the systemd script)

`sudo docker create --name=data4loxone -p 8081:8000 --env-file .env -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone`

Testing: Run and inspect container (Bash is not installed on alpine linux by default)
`sudo docker run --name=data4loxone -p 8081:8000 --env-file .env -it --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone /bin/sh --login`

### Monitoring
`sudo docker inspect [containerID] | grep LogPath` to find the log path where all the console log is kept.
