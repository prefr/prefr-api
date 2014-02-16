#!/bin/bash

export SBT_OPTS="-Dsbt.log.noformat=true"
./sbt clean compile "test-only -- html junitxml console"
