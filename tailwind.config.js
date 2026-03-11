/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ah-navy': '#162A42',
        'ah-indigo': '#1501A5',
        'ah-violet': '#6443DB',
        'ah-blue': '#2A47F6',
        'ah-gray': '#DDDDDD',
        'ah-charcoal': '#202020',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
