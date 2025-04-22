#!/bin/bash

set -e

# This script is used to deploy the Pokemon Finder application using Docker.
# It stops any existing container, builds a new Docker image, and runs the container.
# Ensure the script is run from the directory containing the Dockerfile
# and the application code.

# This script also includes a testing stage using Playwright.
# It builds the application using Vite, starts a preview server, and runs Playwright tests.
# If the tests pass, it proceeds with the Docker deployment.

# Usage: ./deploy.sh

# Define container and image names
CONTAINER_NAME="pokemon-app"
IMAGE_NAME="pokemon-finder"
HOST_PORT=8080
CONTAINER_PORT=80
PREVIEW_PORT=4173 # Default Vite preview port

# --- Pre-checks and Build ---
echo "Ensuring dependencies are installed..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed!"
  exit 1
fi

echo "Building the application with Vite..."
npm run build
if [ $? -ne 0 ]; then
  echo "Vite build (npm run build) failed!"
  exit 1
fi

# --- Testing Stage ---
echo "Starting Vite preview server for testing..."
# Start in background and get PID
npm run preview -- --port $PREVIEW_PORT &
PREVIEW_PID=$!

# Wait a moment for the server to start (adjust sleep time if needed)
sleep 5

echo "Running Playwright tests..."
# Run tests; Playwright will use http://localhost:4173 based on test config/defaults
npx playwright test

TEST_RESULT=$?

echo "Stopping Vite preview server (PID: $PREVIEW_PID)..."
kill $PREVIEW_PID
# Wait for the process to terminate
wait $PREVIEW_PID 2>/dev/null

if [ $TEST_RESULT -ne 0 ]; then
  echo "Playwright tests failed! Aborting deployment."
  exit 1
else
  echo "Playwright tests passed."
fi

# --- Deployment Stage (Only if tests passed) ---
echo "Proceeding with Docker deployment..."

# Stop the existing container (ignore errors if it doesn't exist)
echo "Stopping existing container: $CONTAINER_NAME..."
docker stop $CONTAINER_NAME || true

# Remove the existing container (ignore errors if it doesn't exist)
echo "Removing existing container: $CONTAINER_NAME..."
docker rm $CONTAINER_NAME || true

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
  echo "Docker build failed!"
  exit 1
fi

# Run the new container
echo "Running new container: $CONTAINER_NAME..."
docker run -d -p $HOST_PORT:$CONTAINER_PORT --name $CONTAINER_NAME $IMAGE_NAME

if [ $? -ne 0 ]; then
  echo "Docker run failed!"
  exit 1
fi

echo "Deployment complete. Application should be available at http://localhost:$HOST_PORT"

exit 0