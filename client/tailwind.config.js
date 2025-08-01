/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        darkbg: {
          900: '#111111',
          800: '#181818',
          700: '#232323',
          600: '#2d2d2d',
          500: '#3a3a3a',
        },
        accent: {
          blue: '#3b82f6',
          gray: '#6b7280',
        },
      },
      boxShadow: {},
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 