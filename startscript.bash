NOW=$(date +"%Y-%m-%d")

trap 'pkill -f droplistFillerServer.js' SIGINT SIGTERM EXIT

node droplistFillerServer.js &> "./frontend-$NOW.txt" &

node supremebot.js | tee supreme-$NOW.txt