@ECHO ON
start node droplistFillerServer.js
set currentDate=%date:~6,4%_%date:~3,2%_%date:~0,2%
set logPath=logs/%currentDate%.txt
if not exist logs mkdir logs
>>%logPath% (
	node supremebot.js %1
)