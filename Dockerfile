FROM node:14

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build
RUN npm run update

EXPOSE 8080

CMD [ "node", "server.js" ]
