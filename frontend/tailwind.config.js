/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          light: '#f5f7ff',
          gta: '#ff9800',
          gv: '#6366f1',
          slate: '#0f172a',
        }
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        glassHover: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
      }
    },
  },
  plugins: [],
}


