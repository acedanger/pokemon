# ---- Build Stage ----
FROM node:23-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# ---- Serve Stage ----
FROM caddy:2.10.0-alpine

WORKDIR /srv

# Copy built assets from the build stage
COPY --from=build /app/dist /srv

# Copy Caddy configuration file
COPY Caddyfile /etc/caddy/Caddyfile