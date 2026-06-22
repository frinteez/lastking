/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'sci-navy': '#0A1128',
        'sci-cyan': '#00E5FF',
        'sci-violet': '#7B1FA2',
        'sci-dark': '#121212',
        'sci-panel': '#1C2541'
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 229, 255, 0.7)',
        'neon-violet': '0 0 10px rgba(123, 31, 162, 0.7)',
      }
    },
  },
  plugins: [],
}
