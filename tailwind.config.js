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
          DEFAULT: '#4DD4D4',
          50: '#F0FEFE',
          100: '#CCFBFB',
          200: '#99F6F6',
          300: '#66F0F0',
          400: '#4DD4D4',
          500: '#2DBABA',
          600: '#259999',
          700: '#1C7777',
          800: '#145555',
          900: '#0B3333',
        },
        secondary: {
          DEFAULT: '#5CDFDF',
          50: '#F2FEFE',
          100: '#D9FCFC',
          200: '#B3F9F9',
          300: '#8DF5F5',
          400: '#5CDFDF',
          500: '#3BCCCC',
          600: '#2FA3A3',
          700: '#237A7A',
          800: '#175252',
          900: '#0B2929',
        },
        accent: {
          DEFAULT: '#44E4E4',
          dark: '#2BB8B8',
        },
        background: {
          DEFAULT: '#0A0F0F',
          surface: '#141A1A',
          card: '#1A2222',
        },
        text: {
          primary: '#F0FEFE',
          secondary: '#B3D9D9',
          tertiary: '#7A9999',
        },
        gray: {
          DEFAULT: '#8B9999',
          50: '#F5F7F7',
          100: '#E6EEEE',
          200: '#CCDDDD',
          300: '#B3CCCC',
          400: '#99BBBB',
          500: '#8B9999',
          600: '#708080',
          700: '#556666',
          800: '#3A4D4D',
          900: '#1F3333',
        },
        success: '#00E6A6',
        warning: '#FFD93D',
        error: '#FF6B6B',
        info: '#4DD4D4',
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
