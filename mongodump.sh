#!/bin/bash

echo "Starting devgram dump for mongodb://localhost:27017/devgram-v3"

mongodump --uri=mongodb://localhost:27017/devgram-v3

echo "--Finish Dump--"