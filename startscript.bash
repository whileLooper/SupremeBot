#!/bin/bash
set -x #echo on

if [ "$1" != "fast" ]
then
git pull
pushd droplist-filler-app
ng build
popd
fi

NOW=$(date +"%Y-%m-%d")
trap 'pkill -f droplistFillerServer.js' SIGINT SIGTERM EXIT

mkdir -p logs

node droplistFillerServer.js &> "logs/frontend-$NOW.txt" &

node supremebot.js "$@" | tee logs/supreme-$NOW.txt