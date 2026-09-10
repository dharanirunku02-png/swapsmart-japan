/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metro: {
          bg: '#0a0e17',
          surface: '#111827',
          card: '#162032',
          cardBorder: '#23324a',
          hover: '#1e2c44',
          accent: '#06b6d4',      // Neon Cyan
          emerald: '#10b981',     // Green
          amber: '#f59e0b',       // Yellow / Orange
          rose: '#f43f5e',        // Critical Red
          purple: '#a855f7',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
