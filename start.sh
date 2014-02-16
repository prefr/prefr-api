#!/bin/bash

# get appname
appName=$(ls ./target/universal/stage/bin/ | grep -v ".bat")

echo "Starting app: " $appName

nohup bash -c "./target/universal/stage/bin/$appName -Dsbt.log.noformat=true" &> /dev/null & 