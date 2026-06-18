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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d5e0ff',
          300: '#a3beff',
          400: '#6691ff',
          500: '#4f46e5', // Indigo primary
          600: '#4338ca',
          700: '#3730a3',
          800: '#1e1b4b',
        },
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          500: '#a855f7',
          600: '#9333ea',
        },
        dark: {
          900: '#030712',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          500: '#4b5563',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
