#!/bin/bash

if [ -e ./target/universal/stage/RUNNING_PID ]; then
    pid=$(cat ./target/universal/stage/RUNNING_PID)

    echo "Killing pid "$pid
    kill $pid
else
    echo "no running play app"
fi