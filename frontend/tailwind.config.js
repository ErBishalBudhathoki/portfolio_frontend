/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      keyframes: {
        floatX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(15px)' },
        },
        floatRotate: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        floatSkew: {
          '0%, 100%': { transform: 'translateY(0) skewX(0deg)' },
          '50%': { transform: 'translateY(-12px) skewX(4deg)' },
        },
        floatCrazy: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(-15px) rotate(3deg) scale(1.05)' },
        },
      },
      animation: {
        floatX: 'floatX 4s ease-in-out infinite',
        floatRotate: 'floatRotate 5s ease-in-out infinite',
        floatSkew: 'floatSkew 4.5s ease-in-out infinite',
        floatCrazy: 'floatCrazy 6s ease-in-out infinite',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
      },
      opacity: {
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  safelist: [
    { pattern: /shadow-(primary|secondary|accent|muted|card)\/[0-9]+/ },
  ],
}; 