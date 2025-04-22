#!/bin/bash

set -e

# filepath: /home/acedanger/dev/pokemon/deploy.sh

# Define container and image names
CONTAINER_NAME="pokemon-app"
IMAGE_NAME="pokemon-finder"
HOST_PORT=8080
CONTAINER_PORT=80
PREVIEW_PORT=4173 # Default Vite preview port
RUN_TESTS=false # Default: do not run tests

# --- Argument Parsing ---
# Check if the first argument is --test or -t
if [[ "$1" == "--test" || "$1" == "-t" ]]; then
  RUN_TESTS=true
  echo "Test flag provided. Tests will be run before deployment."
fi

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

# --- Testing Stage (Conditional) ---
if [ "$RUN_TESTS" = true ]; then
  echo "--- Running Testing Stage ---"
  echo "Starting Vite preview server for testing..."
  # Start in background and get PID
  npm run preview -- --port $PREVIEW_PORT &
  PREVIEW_PID=$!

  # Wait a moment for the server to start (adjust sleep time if needed)
  echo "Waiting for preview server to start (PID: $PREVIEW_PID)..."
  sleep 5 # Adjust as necessary

  # Check if server is running (optional but good practice)
  if ! kill -0 $PREVIEW_PID 2>/dev/null; then
      echo "Preview server failed to start!"
      # Attempt to kill if PID exists but process doesn't respond to -0
      kill $PREVIEW_PID 2>/dev/null || true
      exit 1
  fi

  echo "Running Playwright tests..."
  # Run tests; Playwright will use http://localhost:4173 based on test config/defaults
  npx playwright test
  TEST_RESULT=$?

  echo "Stopping Vite preview server (PID: $PREVIEW_PID)..."
  # Send SIGTERM first for graceful shutdown, then SIGKILL if needed
  kill $PREVIEW_PID || true
  # Wait for the process to terminate
  wait $PREVIEW_PID 2>/dev/null

  if [ $TEST_RESULT -ne 0 ]; then
    echo "Playwright tests failed! Aborting deployment."
    exit 1
  else
    echo "Playwright tests passed."
  fi
  echo "--- Testing Stage Complete ---"
else
    echo "Skipping testing stage (run with --test or -t to include)."
fi

# --- Deployment Stage ---
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