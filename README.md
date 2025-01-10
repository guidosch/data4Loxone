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
All config options are in the .env file. It will be loaded during runtime (by dotenv) package together with the `config.ts` file. The .env file will not be copied to the image for security reasons and you have to pass the variables over the docker `run/create` command.

The tokens are stored in a docker volume called tokenStorage (`sudo docker volume inspect tokenStorage`). The inspect command allows you to see the mountpoint of the volume. The tokenStorage folder in my app is not copied to the container by the docker create/run command because of the syntax beeing:

`docker run --volume <volume-name>:<mount-path>`

So the volume name points to the location revealed by docker inspect! So if you have to populate new tokens when they somenow expired you have to stop the container and copy the new tokens to the effective mount point location!
See: https://docs.docker.com/engine/storage/volumes/

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
docker build . -t guidosch/node-app-data4loxone to create the new image (do run on raspi because of ARM)
sudo docker create --name=data4loxone -p 8081:8000 --env-file .env -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone
sudo systemctl start docker-data4loxone.service
``````
### Create Image 
Do it on the raspberry 4 to create a ARM 64 compatible image (-t is for the image name)

`docker build . -t guidosch/node-app-data4loxone`

Create the new container (create command below...) the tokens are stored outside and in a volume and are mounted on start of the container

### Run/create the docker image

(sudo docker volume inspect tokenStorage)

You also can copy files from the continer to host: docker cp container_id:./bar/foo.txt . eg. to test locally with the current tokens

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

### Monitoring / Logging dir
`sudo docker inspect [containerID] | grep LogPath` to find the log path where all the console log is kept.
