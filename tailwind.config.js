/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#083F5E',
          gold: '#EECC4E',
        },
        card: { orange: '#F79C22' },
        cream: '#F8ECA7',
        danger: '#A71F26',
        sky: '#99BFDE',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        captain: '0 0 20px #EECC4E',
      },
    },
  },
  plugins: [],
}
