/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Segoe UI"', 'sans-serif'],
        display: ['"Space Grotesk"', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"Azeret Mono"', '"Consolas"', 'monospace']
      },
      boxShadow: {
        panel: '0 22px 60px -28px rgba(13, 18, 32, 0.35)'
      }
    }
  },
  plugins: []
};
