#!/bin/bash

id=$1
hostname=localhost:9000

curl $hostname/api/ballotBox/$id/preftoolCandidates > candidates.txt
curl $hostname/api/ballotBox/$id/preftoolBallots > ballots.txt
