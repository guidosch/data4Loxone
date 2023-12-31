FROM --platform=linux/arm64 node:18-alpine as ts-environment
WORKDIR /usr/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . ./

RUN npm run build

ENV NODE_ENV=production
EXPOSE 8000/tcp

CMD ["node", "dist/src/index.js"]
