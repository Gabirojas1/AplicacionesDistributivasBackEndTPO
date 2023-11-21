FROM node:18.2.0 as base

RUN npm install -g nodemon

WORKDIR /app
COPY package*.json /
EXPOSE 8080

FROM base as dev

RUN npm install

COPY . /

RUN npm install