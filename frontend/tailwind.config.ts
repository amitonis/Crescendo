import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F4F4F0',
        surface: '#FFFFFF',
        border: '#E0E0D8',
        'text-primary': '#1A1A1A',
        'text-secondary': '#666660',
        'text-muted': '#999990',
        silver: {
          DEFAULT: '#A8A9AD',
          light: '#D4D5D9',
          dark: '#6B6C70',
        },
        action: {
          DEFAULT: '#1DA0C3',
          hover: '#1589A8',
        },
        success: '#2D9B4F',
        error: '#D64045',
        warning: '#E5A020',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
