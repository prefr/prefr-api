#!/bin/bash

# get appname
appName=$(ls | grep -v ".bat")

nohup bash -c "./target/universal/stage/bin/$appName -Dhttp.port=9001" &