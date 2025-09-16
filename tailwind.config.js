/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e9b71',
          50: '#e6f2ee',
          100: '#b3d9c8',
          200: '#80c0a2',
          300: '#4da77c',
          400: '#1e9b71',
          500: '#1a8660',
          600: '#167050',
          700: '#125b40',
          800: '#0e4630',
          900: '#0a3020',
        },
        secondary: {
          DEFAULT: '#31d7a6',
          50: '#e8f8f3',
          100: '#c2ebd9',
          200: '#9cdfc0',
          300: '#76d2a7',
          400: '#31d7a6',
          500: '#2bc194',
          600: '#25ab82',
          700: '#1f9570',
          800: '#197f5e',
          900: '#13694c',
        },
        background: {
          DEFAULT: '#0b0f0e',
          surface: '#111618',
        },
        text: {
          primary: '#e6f2ee',
          secondary: '#a7c3ba',
        },
        success: '#2ecc71',
        warning: '#f1c40f',
        error: '#e74c3c',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',
        'xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
