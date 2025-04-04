const flowbiteReact = require('flowbite-react/plugin/tailwindcss')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    '.flowbite-react/class-list.json',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin'),
    flowbiteReact,
  ],
  darkMode: 'class',
}
