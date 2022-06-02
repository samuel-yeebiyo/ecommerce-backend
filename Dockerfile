FROM node:16-buster-slim

RUN apt-get -y update\
        && apt-get -y upgrade \
        && apt install -y redis-server\
        && mkdir /home/app

WORKDIR /home/app

ENV SERVER_PORT=8000

ENV REDIS_HOST=myredis

EXPOSE 8000

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
