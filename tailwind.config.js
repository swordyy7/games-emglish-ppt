/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'd4af37': '#D4AF37',
        'ff8c00': '#FF8C00',
        'ff6b35': '#FF6B35',
        'ffb800': '#FFB800',
        'e6c229': '#E6C229',
      },
      animation: {
        'slide-in-from-top': 'slideInFromTop 0.3s ease-out',
      },
      keyframes: {
        slideInFromTop: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};