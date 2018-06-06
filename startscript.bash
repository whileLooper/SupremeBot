#!/bin/bash

if [[ $@ = *"testing"* ]]
then
echo "Testing on Linux does not work, because it can not run in non headless mode"
exit 1
fi

if [[ $@ = *"fast"* ]]
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