/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bmw: {
          bg: '#09090b',
          surface: '#111113',
          surface2: '#18181b',
          blue: '#1C69D4',
          silver: '#94A3B8',
          green: '#22C55E',
          gold: '#EAB308',
          red: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'bmw-blue': '0 0 10px rgba(28,105,212,0.12)',
        'bmw-green': '0 0 10px rgba(34,197,94,0.12)',
        'bmw-silver': '0 0 10px rgba(148,163,184,0.12)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
