FROM node:16-buster

RUN apt-get -y update\
        && apt-get -y upgrade \
        && apt install -y redis-server\
	&& apt install build-essential -y\
        && mkdir /home/app

WORKDIR /home/app

ENV SERVER_PORT=8000

ENV REDIS_HOST=myredis

EXPOSE 8000

COPY ["package.json", "package-lock.json", "./"]

# RUN npm install -g npm@8.12.0

RUN npm install

COPY . .

CMD redis-server --daemonize yes;npm run dev
