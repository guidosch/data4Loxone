#!/bin/bash

//check exix code of command
container=$(sudo docker container inspect data4loxone)
if [ $? -eq 0 ]; then
    echo "Container exists"
else
    echo "Container does not exist"
    exit 1
fi
