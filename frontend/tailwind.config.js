/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f172a',
        accent: '#38bdf8',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(2, 6, 23, 0.45)',
        alert: '0 0 0 1px rgba(248,113,113,0.65), 0 0 28px rgba(248,113,113,0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(248,113,113,0.55), 0 0 20px rgba(248,113,113,0.25)' },
          '50%': { boxShadow: '0 0 0 1px rgba(248,113,113,0.85), 0 0 32px rgba(248,113,113,0.45)' },
        },
      },
      animation: {
        pulseRed: 'pulseRed 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
