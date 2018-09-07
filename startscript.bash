#!/bin/bash

if [[ $@ = *"testing"* ]] && [[ $@ = *"puppeteer"* ]]
then
echo "Testing on Linux does not work, because it can not run in non headless mode"
fi

if [[ $@ != *"fast"* ]]
then
git pull
pushd droplist-filler-app
ng build
popd
fi

NOW=$(date +"%Y-%m-%d_%H:%M:%S")
trap 'pkill -f droplistFillerServer.js' SIGINT SIGTERM EXIT

mkdir -p logs

node droplistFillerServer.js &> "logs/frontend-$NOW.txt" &

node supremebot.js "$@" | tee logs/supreme-$NOW.txt