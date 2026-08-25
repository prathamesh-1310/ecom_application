/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#D4AF37',
          500: '#C9A96E',
          600: '#B59453',
        },
        onyx: {
          800: '#1A1A1A',
          900: '#111111',
          950: '#0B0B0B',
        },
        beige: {
          50: '#FAF8F5',
          100: '#F4EFEA',
          200: '#E8DFD5',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
