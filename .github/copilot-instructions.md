## Project Overview

This is a Pokémon finder web application built with Vite, Tailwind CSS, and vanilla JavaScript (ES Modules). It fetches data from the PokéAPI using the `pokedex-promise-v2` library.

## Key Features & Logic

*   **Search:** Allows searching by text input or voice (Web Speech API).
*   **Display:** Shows the current Pokémon's image, name, types, height, and weight.
*   **History:**
    *   Displays the last 3 successfully searched Pokémon.
    *   Stores the full data object returned by the API for each history item.
    *   The most recent item is displayed at 100% scale, the second at 80%, the third at 60%.
    *   When a new Pokémon is successfully searched:
        *   Any existing entry for that Pokémon is removed from the history array.
        *   The new data object is added to the *beginning* of the history array.
        *   The array is trimmed to a maximum of 3 items.
        *   The history display is re-rendered.
        *   The newly added/moved item animates in with a slide/fade effect (0.8s duration).
    *   History items are clickable to re-trigger a search for that Pokémon.
*   **Error Handling:** Displays user-friendly messages, especially for "Not Found" (404) errors. Technical errors are logged to the console.

## Build & Deployment

*   **Build Tool:** Vite. Uses `vite-plugin-node-polyfills` to handle Node.js built-ins for browser compatibility.
*   **Containerization:** Dockerfile uses a multi-stage build (Node build stage, Nginx serve stage).
*   **Deployment Script (`deploy.sh`):**
    *   Automates `npm install`, `npm run build`.
    *   Optionally runs Playwright tests (`--test` or `-t` flag) against the production build served by `vite preview`.
    *   Stops/removes the existing Docker container.
    *   Builds the Docker image.
    *   Runs the new Docker container.
    *   Requires the user to be in the `docker` group for permissions.

## Testing

*   **Framework:** Playwright for E2E tests (`tests/pokemon.spec.js`).
*   **Execution:** Can be run manually or via the `deploy.sh --test` flag.

## Known Issues / Current Focus

*   Refining the history update logic to avoid visual duplication or incorrect animation triggers when a Pokémon is re-searched. (As per user's last request).

## Preferences

*   Keep error messages user-friendly.
*   Use Tailwind CSS for styling where possible.
*   Maintain clear separation of concerns in the JavaScript code.