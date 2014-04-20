#!/bin/bash

if [ -z $1 ]; then
	echo image name required
	exit 1
fi

# compile code
./sbt clean compile stage

sudo docker build -t ${1} --rm .

if [ "$2" == "push" ]; then
	sudo docker push ${1}
fi