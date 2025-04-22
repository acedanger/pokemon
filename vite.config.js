import { defineConfig } from "vite";
// Import the new plugin
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  // Keep build target reasonable, 'modules' is often a good balance
  build: {
    target: "modules",
    // Rollup options are not needed for this plugin
  },
  plugins: [
    // Add the plugin to Vite's plugins array
    nodePolyfills({
      // Options (optional):
      // - 'true'/'false' to include/exclude specific polyfills.
      // - 'build' to only include polyfills for the build.
      // - 'dev' to only include polyfills for the dev server.
      // By default, it polyfills globals like `Buffer` and `process`.
      // You might need to explicitly enable others if errors persist.
      // Example: globals: { Buffer: true, global: true, process: true },
      // Example: protocolImports: true, // If you need imports like 'node:fs'
    }),
  ],
  // optimizeDeps and resolve.alias sections related to polyfills
  // are likely no longer needed with this plugin.
});
