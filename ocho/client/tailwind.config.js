/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#5170FD',
            dark: '#3B4FD6',
            tint: '#E8ECFF',
            50: '#F0F3FF',
            100: '#E8ECFF',
            500: '#5170FD',
            600: '#3B4FD6',
            700: '#2A3BB8',
          },
          orange: {
            DEFAULT: '#FA8232',
            hover: '#E87121',
            dark: '#D15E12',
          },
          purple: {
            DEFAULT: '#3A1FB0',
            dark: '#281480',
          },
          surface: '#f5f5f7',
          surfaceSubtle: '#fafafa',
          border: '#e5e5ea',
          borderSubtle: '#f0f0f2',
          inputBorder: '#d1d1d6',
          text: {
            primary: '#000000',
            secondary: '#86868b',
          },
          warning: {
            bg: '#FFF1D0',
            text: '#6B4A00',
          },
          success: {
            bg: '#E6F9F0',
            text: '#0F7B46',
            DEFAULT: '#0F7B46',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-family-base)'],
        display: ['var(--font-family-base)'],
        brand: ['var(--font-family-base)'],
        logo: ["'Fredoka'", "'Baloo 2'", 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(20, 24, 43, 0.06), 0 4px 16px -4px rgba(20, 24, 43, 0.08)',
        card: '0 1px 3px rgba(20, 24, 43, 0.05), 0 10px 25px -5px rgba(20, 24, 43, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
