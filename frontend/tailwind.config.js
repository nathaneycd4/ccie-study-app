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
        cyber: {
          bg: '#0a0a0f',
          surface: '#0d1117',
          surface2: '#161b22',
          cyan: '#00ffff',
          magenta: '#ff00ff',
          green: '#00ff41',
          yellow: '#ffff00',
          red: '#ff0040',
        }
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)',
        'neon-magenta': '0 0 10px rgba(255,0,255,0.5), 0 0 20px rgba(255,0,255,0.3)',
        'neon-green': '0 0 10px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.3)',
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
