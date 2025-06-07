/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00DBCE",
        background: "#F4F4F4",
        white: "#FFFFFF",
        black: "#000000",
        gray: colors.gray,
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 