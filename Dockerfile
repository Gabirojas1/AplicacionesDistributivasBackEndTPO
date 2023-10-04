FROM node:18.2.0 as base

WORKDIR /app
COPY package*.json /
EXPOSE 8080

FROM base as dev

RUN npm install

COPY . /

CMD [ "node --inspect", "index.js" ]