/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFFBF2',
          100: '#FFF4D9',
          200: '#FFE8B0',
          300: '#FFD98A',
          400: '#F7C165',
          500: '#E6A94B',
          600: '#C68534',
          700: '#9C6226',
        },
        slateInk: {
          900: '#1C2027',
          800: '#2B313C',
          600: '#505968',
        },
        cool: {
          50: '#F2F7FF',
          200: '#BFD4FF',
          500: '#4A6FFF',
          600: '#3557DD',
        },
        mint: {
          100: '#E3F5EE',
          400: '#4CC38A',
        },
      },
      boxShadow: {
        card: '0 12px 30px rgba(17, 24, 39, 0.08)',
        soft: '0 8px 20px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
