#!/bin/sh
git pull
docker pull node:14
docker build -t skunk/ogd-wikimedia-osm-checker .
docker container rm -f checker
docker run --name checker --restart=always -p 127.0.0.1:43210:8080 -v /home/skunk/code/ogd-wikimedia-osm-checker/log:/usr/src/app/log -d skunk/ogd-wikimedia-osm-checker
