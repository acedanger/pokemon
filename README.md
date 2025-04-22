# Pokémon Finder

A simple web application to search for Pokémon information using the PokéAPI. Users can search by typing a Pokémon name or using voice input. The application is built with modern web technologies and containerized using Docker for easy deployment.

## Features

*   Search for Pokémon by name.
*   Search for Pokémon using voice input (requires browser support for Web Speech API and microphone permission).
*   Displays Pokémon image, type(s), height, and weight.
*   Responsive design using Tailwind CSS.
*   Containerized with Docker for consistent deployment.
*   Automated build, testing, and deployment script (`deploy.sh`).

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript (ES Modules)
*   **Styling:** Tailwind CSS
*   **Build Tool:** Vite
*   **API:** PokéAPI v2 (via `pokedex-promise-v2` library)
*   **Voice Input:** Web Speech API
*   **Testing:** Playwright (for End-to-End tests)
*   **Containerization:** Docker
*   **Deployment Automation:** Bash Script (`deploy.sh`)

## Setup and Running Locally (Development)

1.  **Prerequisites:**
    *   Node.js (v18 or later recommended) and npm
    *   Git (optional, for cloning)
2.  **Clone the repository (optional):**
    ```bash
    git clone <repository-url>
    cd pokemon
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local server (usually at `http://localhost:5173`) with hot module replacement.

## Deployment (`deploy.sh`)

The `deploy.sh` script automates the process of building the application, optionally running tests, and deploying it as a Docker container.

**Prerequisites for Deployment:**

*   Docker installed and running.
*   Your user must have permission to interact with the Docker daemon (usually by being in the `docker` group - see Docker documentation for setup).
*   Node.js and npm (for the build and test steps).
*   Playwright browsers installed (`npx playwright install`) if running tests.

**Why use `deploy.sh`?**

*   Ensures a consistent build and deployment process.
*   Stops and removes old containers before starting a new one.
*   Optionally runs E2E tests against the production build before deploying.
*   Simplifies the multi-step deployment into a single command.

**Usage:**

1.  Make the script executable (only needs to be done once):
    ```bash
    chmod +x deploy.sh
    ```
2.  **Deploy without running tests:**
    ```bash
    ./deploy.sh
    ```
3.  **Deploy AND run tests before deployment:**
    ```bash
    ./deploy.sh --test
    ```
    or
    ```bash
    ./deploy.sh -t
    ```
    The application will be available at `http://localhost:8080` (or the `HOST_PORT` defined in the script) after successful deployment.

## Testing

End-to-End tests are implemented using Playwright and located in the `tests/` directory.

*   **Run tests manually:**
    ```bash
    # Build the app first
    npm run build
    # Start the preview server
    npm run preview &
    # Run tests (ensure preview server is running)
    npx playwright test
    # Stop the preview server manually when done
    ```
*   **Run tests as part of deployment:** Use the `--test` or `-t` flag with the `deploy.sh` script as described above.