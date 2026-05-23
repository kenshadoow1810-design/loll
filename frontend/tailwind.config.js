
export default {
  content: [
    "./index.html",
    "./src*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      colors: {
        gold: { 400: '#F0C040', 500: '#C89B3C', 600: '#785A28' },
        dark: { 50: '#1E2328', 100: '#1A1C23', 200: '#0F1014', 300: '#0A0B0E' },
        accent: { blue: '#0AC8B9', purple: '#7B2FBE', red: '#E84057' },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(240,192,64,0.3)' },
          '50%': { borderColor: 'rgba(240,192,64,0.8)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.4s ease forwards',
        pulseBorder: 'pulse-border 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

