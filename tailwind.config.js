/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Scan index.html
    "./index.js", // Scan index.js for potential dynamic classes (optional but good practice)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
