/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7e6',
          100: '#ffedc2',
          200: '#ffd98a',
          300: '#ffc45a',
          400: '#ffb133',
          500: '#f59b23',
          600: '#d47c16',
          700: '#b06012'
        },
        ink: {
          50: '#f6f7f9',
          100: '#eef1f5',
          200: '#d9dfe7',
          300: '#b7c2d1',
          400: '#8795a8',
          500: '#617085',
          600: '#445066',
          700: '#2f3848',
          800: '#1f2633',
          900: '#141922'
        },
        teal: {
          500: '#3ca7a4',
          600: '#2a8b88'
        },
        indigo: {
          500: '#5563ff',
          600: '#3d48d4'
        }
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17, 24, 39, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
