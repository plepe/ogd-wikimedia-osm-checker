FROM node:14

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run prepare
RUN npm run download

EXPOSE 8080

CMD [ "node", "server.js" ]
