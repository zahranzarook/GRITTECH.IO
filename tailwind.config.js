/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,css}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#101211',
        deepMatte: '#171C18',
        graphite: '#252A26',
        softWhite: '#E9ECE7',
        industrialLime: '#83A94B',
        mutedNeon: '#A6FF4D',
        dullOlive: '#6B8F3D',
        industrialSage: '#788078',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
