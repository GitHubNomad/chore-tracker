/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0051ae',
          bright: '#0969da',
          light: '#d8e2ff',
          dim: '#adc6ff',
        },
        surface: {
          DEFAULT: '#f7f9ff',
          low: '#f0f4fc',
          mid: '#eaeef6',
          high: '#e4e8f0',
          white: '#ffffff',
        },
        ink: {
          DEFAULT: '#171c22',
          muted: '#424753',
          faint: '#727785',
        },
        border: {
          DEFAULT: '#c2c6d6',
          dark: '#727785',
        },
        easy: { bg: '#d1f2d8', accent: '#2dba4e', dark: '#005320' },
        medium: { bg: '#fff3c4', accent: '#d4a017', dark: '#7a5000' },
        hard: { bg: '#ffd8b1', accent: '#f6851b', dark: '#8a3a00' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 0 rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
        'card-hover': '0 6px 0 rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.07)',
        'btn-primary': '0 4px 0 #003f88',
        'btn-green': '0 4px 0 #004d19',
        'btn-red': '0 4px 0 #7a0000',
        'btn-white': '0 4px 0 rgba(0,0,0,0.12)',
        nav: '0 -2px 12px rgba(0,0,0,0.06)',
        header: '0 2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
