import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020", // Or try 'es2020' or 'modules' if 'esnext' doesn't work
  },
});
