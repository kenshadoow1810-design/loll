/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lol-gold': '#C89B3C',
        'lol-dark': '#0A0A0C',
        'lol-blue': '#0AC8B9',
        'lol-red': '#FF4E50',
        'lol-purple': '#BF96F7',
      }
    },
  },
  plugins: [],
}
