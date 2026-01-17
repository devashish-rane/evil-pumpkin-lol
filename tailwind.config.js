/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff9eb',
          100: '#fff1cc',
          200: '#ffe4a3',
          300: '#ffd46f',
          400: '#ffc24c',
          500: '#f6a02b',
          600: '#dc7f1d',
          700: '#b85f1a',
          800: '#934a19',
          900: '#783d17'
        },
        slateblue: {
          500: '#4a5ad7',
          600: '#3e4ab8'
        },
        tealsoft: {
          500: '#3aa6a3'
        },
        ink: '#14161a',
        paper: '#f7f6f3'
      },
      boxShadow: {
        card: '0 12px 30px rgba(20, 22, 26, 0.08)',
        soft: '0 8px 20px rgba(20, 22, 26, 0.06)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    }
  },
  plugins: []
};
