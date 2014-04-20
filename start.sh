#!/bin/bash

# get appname
appName=$(ls ./target/universal/stage/bin/ | grep -v "[.bat|.log]")

echo "Starting app: " $appName

nohup bash -c "./target/universal/stage/bin/$appName -mem 200 -Dhttp.port=9001" &