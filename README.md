
# This script is used to deploy the Pokemon Finder application using Docker.
# It stops any existing container, builds a new Docker image, and runs the container.
# Ensure the script is run from the directory containing the Dockerfile
# and the application code.

# This script also includes a testing stage using Playwright.
# It builds the application using Vite, starts a preview server, and runs Playwright tests.
# If the tests pass, it proceeds with the Docker deployment.

# Usage: ./deploy.sh