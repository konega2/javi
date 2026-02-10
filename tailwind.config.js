/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vitalia-purple': '#7C3AED',
        'vitalia-purple-dark': '#6D28D9',
        'vitalia-purple-light': '#8B5CF6',
        'vitalia-green': '#86EFAC',
        'vitalia-green-soft': '#BBF7D0',
      },
    },
  },
  plugins: [],
}
