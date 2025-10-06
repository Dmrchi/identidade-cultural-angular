/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    fontFamily: {
      'open-sans': ['Open Sans', 'sans-serif'],
      'roboto': ['Roboto', 'sans-serif']
    },
    extend: {},
  },
  plugins:  [
    require('flowbite/plugin'),
],
}

