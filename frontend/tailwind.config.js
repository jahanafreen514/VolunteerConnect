/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Soft Pastel Primary (Gentle Periwinkle / Soft Iris)
        primary: {
          50: '#f6f7fe',
          100: '#eceffd',
          200: '#dadffc',
          300: '#bcc4f9',
          400: '#9aa5f4',
          500: '#7c89ee',
          600: '#6672de',
          700: '#545ec4',
          800: '#464ea2',
          900: '#3c4381',
          950: '#23264c',
        },
        // Soft Pastel Secondary (Serene Baby Blue / Soft Sky)
        secondary: {
          50: '#f2f8fd',
          100: '#e3f1fc',
          200: '#cce5fa',
          300: '#a7d2f6',
          400: '#7bb7ef',
          500: '#579ee5',
          600: '#3e83cf',
          700: '#3269a8',
          800: '#2d578a',
          900: '#284971',
          950: '#192e48',
        },
        // Soft Pastel Accent (Soft Sage / Celadon / Pale Mint)
        accent: {
          50: '#f3faf6',
          100: '#e3f5ec',
          200: '#c8ebd9',
          300: '#a0dec0',
          400: '#74caa2',
          500: '#4fb387',
          600: '#3d9670',
          700: '#32775a',
          800: '#2a5f4a',
          900: '#244f3e',
          950: '#112b22',
        },
        // Soft Pastel Warm / Rose (Blush / Dusty Coral)
        pastel: {
          rose: '#fca5a5',
          blush: '#faa5b5',
          peach: '#fdba74',
          apricot: '#fbc2a2',
          butter: '#fde68a',
          honey: '#fcd182',
          mint: '#a7f3d0',
          sage: '#a0dec0',
          sky: '#bae6fd',
          periwinkle: '#bcc4f9',
          lavender: '#d8b4fe',
          lilac: '#d5bef8',
        },
        // Surface colors for clean soft light mode and soft velvety dark mode
        surface: {
          50: '#fbfbfe',
          100: '#f4f6fc',
          200: '#eaedf7',
          300: '#d7dcf0',
          700: '#1a2238',
          800: '#141a2e',
          900: '#0d1324',
          950: '#080c18',
        }
      },
      boxShadow: {
        // Softer pastel diffuse shadows (replacing harsh neon glows)
        'glow-sm': '0 2px 12px -2px rgba(124, 137, 238, 0.20)',
        'glow-md': '0 8px 24px -4px rgba(124, 137, 238, 0.22)',
        'glow-lg': '0 16px 36px -6px rgba(124, 137, 238, 0.25)',
        'glow-accent': '0 8px 24px -4px rgba(116, 202, 162, 0.22)',
        'glow-cyan': '0 8px 24px -4px rgba(123, 183, 239, 0.22)',
        'glass': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 10px 32px -5px rgba(0, 0, 0, 0.45)',
        'pastel': '0 10px 25px -5px rgba(154, 165, 244, 0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'blob': 'blob 12s infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'gradient': 'gradient 12s ease infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(25px, -30px) scale(1.06)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.94)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.03)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [],
}
