/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          light: '#f2f8f5',
          DEFAULT: '#90b4a4',
          dark: '#587a68'
        },
        warm: {
          DEFAULT: '#e6a47a',
          dark: '#c47d52'
        }
      }
    },
  },
  plugins: [],
}
