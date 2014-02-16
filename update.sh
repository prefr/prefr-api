#!/bin/bash

./stop.sh
git pull
./compile.sh
./start.sh
