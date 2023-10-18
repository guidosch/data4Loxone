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
All config options are in the .env file. It will be loaded during runtime (by dotenv) package together with the `config.ts` file. The .env file will not be copied to the image for security reasons and you have to pass the variables over the docker run/create command.

## Build the Docker image (arm64 for raspberry PI 4)
`docker build . -t guidosch/node-app-data4loxone`

### Run the docker image
Run in background (-d param). App inside container runs on port 8000
`sudo docker run --name=data4loxone -p 8081:8000 -d --env-file .env --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone`

Run and inspect container (Bash is not installed on alpine linux by default)
`sudo docker run --name=data4loxone -p 8081:8000 --env-file .env -it --rm -v tokenStorage:/usr/app/dist/tokenStorage guidosch/node-app-data4loxone /bin/sh --login`
