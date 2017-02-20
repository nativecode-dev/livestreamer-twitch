#!/bin/sh

DOCKER=docker
DOCKER_NAME=livestreamer
DOCKER_VERSION=latest

###############################################################################
$DOCKER stop $DOCKER_NAME
$DOCKER rm $DOCKER_NAME
$DOCKER rmi $DOCKER_NAME:$DOCKER_VERSION

$DOCKER build --tag $DOCKER_NAME:$DOCKER_VERSION .
$DOCKER run -d \
    --name $DOCKER_NAME \
    --volume /data/$DOCKER_NAME/conf:/etc/$DOCKER_NAME \
    $DOCKER_NAME:$DOCKER_VERSION
###############################################################################
