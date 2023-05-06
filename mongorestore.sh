#!/bin/bash

echo "Starting devgram restore for mongodb://localhost:27017/devgram-v3"

pwd

mongorestore ./dump

echo "--Finish restoring--"