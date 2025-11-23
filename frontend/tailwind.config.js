/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-dark': '#001F3F',
        'navy-darker': '#001C43',
        'blue-primary': '#0F51AF',
        'gray-text': '#627182',
        'gray-light': '#D9D9D9',
        'bg-light': 'rgba(0, 28, 67, 0.05)',
      },
    },
  },
  plugins: [],
}