#!/bin/bash

id=$1
hostname=http://prefr.org

curl $hostname/api/ballotBox/$id/preftoolCandidates > candidates.txt 2> /dev/null
curl $hostname/api/ballotBox/$id/preftoolBallots > ballots.txt 2>/dev/null
result=$(curl $hostname/api/ballotBox/$id/preftoolResult 2>/dev/null)

pt_result=$(preftools-v0.9/schulze -d l -c candidates.txt -b ballots.txt 2>/dev/null | sed -n '/Ranking/,/Direct/p' | head -n -2 | tail -n +2)

if [ "$result" == "$pt_result" ]; then
	echo OK
else
	echo NOT OK
	diff <(echo $result) <(echo $pt_result)
fi
