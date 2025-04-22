#!/bin/bash

set -e

# This script is used to deploy the Pokemon Finder application using Docker.
# It stops any existing container, builds a new Docker image, and runs the container.
# Ensure the script is run from the directory containing the Dockerfile
# and the application code.
# Usage: sudo ./deploy.sh

# Define container and image names
CONTAINER_NAME="pokemon-app"
IMAGE_NAME="pokemon-finder"
HOST_PORT=8080
CONTAINER_PORT=80

# Stop the existing container (ignore errors if it doesn't exist)
echo "Stopping existing container: $CONTAINER_NAME..."
docker stop $CONTAINER_NAME || true

# Remove the existing container (ignore errors if it doesn't exist)
echo "Removing existing container: $CONTAINER_NAME..."
docker rm $CONTAINER_NAME || true

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed!"
  exit 1
fi

# Run the new container
echo "Running new container: $CONTAINER_NAME..."
docker run -d -p $HOST_PORT:$CONTAINER_PORT --name $CONTAINER_NAME $IMAGE_NAME

# Check if run was successful
if [ $? -ne 0 ]; then
  echo "Docker run failed!"
  exit 1
fi

echo "Deployment complete. Application should be available at http://localhost:$HOST_PORT"

exit 0