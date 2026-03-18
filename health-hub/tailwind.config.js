/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          orange: '#f97316',
          red: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
