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
        // Specified Pastel Color System
        pastel: {
          sage: '#BFD8C2',
          mint: '#D8EEE5',
          powder: '#C9DDF2',
          lavender: '#DDD5F3',
          blush: '#F2D6DD',
          cream: '#FFF8EF',
          peach: '#F6D8C5',
          sageDark: '#AFCDB5',
          sageDeep: '#26372B',
          textMuted: '#354052',
          textSecondary: '#667085',
          border: '#E6E8EC',
        },
        // Muted Primary (Sage / Gentle Forest)
        primary: {
          50: '#f4f8f5',
          100: '#e5efe7',
          200: '#d1e3d5',
          300: '#BFD8C2',
          400: '#AFCDB5',
          500: '#8fad95',
          600: '#6f8d75',
          700: '#556e5a',
          800: '#3e5142',
          900: '#26372B',
          950: '#141e17',
        },
        // Muted Secondary (Powder Blue)
        secondary: {
          50: '#f5f9fd',
          100: '#e8f2fc',
          200: '#d5e6f8',
          300: '#C9DDF2',
          400: '#a3c5eb',
          500: '#7faadc',
          600: '#5e8bc2',
          700: '#466c9c',
          800: '#365377',
          900: '#2d4360',
          950: '#192637',
        },
        // Soft Mint Accent
        accent: {
          50: '#f3faf7',
          100: '#e5f6ef',
          200: '#D8EEE5',
          300: '#bce1d3',
          400: '#94cbb7',
          500: '#6fb29a',
          600: '#54947f',
          700: '#427666',
          800: '#365f53',
          900: '#2d4e44',
          950: '#172b25',
        },
        // Supporting Soft Tones
        lavender: {
          50: '#faf8fe',
          100: '#f2eefc',
          200: '#DDD5F3',
          300: '#c5b8eb',
          400: '#a894df',
          500: '#8e74d1',
          600: '#7556bf',
          700: '#5e439d',
        },
        blush: {
          50: '#fdf7f8',
          100: '#faeff2',
          200: '#F2D6DD',
          300: '#e6b5c1',
          400: '#d48ea0',
          500: '#be6b80',
        },
        peach: {
          50: '#fef9f6',
          100: '#fdf2eb',
          200: '#F6D8C5',
          300: '#eebd9e',
          400: '#e09d73',
          500: '#cf7b4a',
        },
        // Surface and Text definitions
        surface: {
          card: 'rgba(255, 255, 255, 0.85)',
          overlay: 'rgba(255, 248, 239, 0.65)',
          border: '#E6E8EC',
          text: '#354052',
          secondary: '#667085',
        }
      },
      boxShadow: {
        'soft-sm': '0 2px 8px rgba(80, 90, 100, 0.04)',
        'soft-md': '0 8px 30px rgba(80, 90, 100, 0.08)',
        'soft-lg': '0 14px 40px rgba(80, 90, 100, 0.10)',
        'soft-hover': '0 12px 35px rgba(70, 85, 95, 0.12)',
        'pastel-sage': '0 8px 24px -4px rgba(175, 205, 181, 0.40)',
        'pastel-powder': '0 8px 24px -4px rgba(201, 221, 242, 0.40)',
        'pastel-lavender': '0 8px 24px -4px rgba(221, 213, 243, 0.40)',
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'blob-slow': 'blob 22s infinite ease-in-out',
        'pulse-subtle': 'pulseSubtle 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.04)' },
          '66%': { transform: 'translate(-15px, 12px) scale(0.96)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.22', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(1.02)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [],
}
