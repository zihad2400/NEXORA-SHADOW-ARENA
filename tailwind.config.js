/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080A12',
          secondary: '#0D1120',
          card: '#12182A',
          elevated: '#182137',
        },
        violet: { DEFAULT: '#8B5CF6', soft: '#A78BFA' },
        cyan: { DEFAULT: '#22D3EE', soft: '#67E8F9' },
        success: '#34D399',
        warning: '#FBBF24',
        error: '#FB7185',
        text: { primary: '#F8FAFC', secondary: '#94A3B8' },
        border: 'rgba(148,163,184,0.15)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 24px -4px rgba(139,92,246,0.4)',
        'glow-cyan': '0 0 24px -4px rgba(34,211,238,0.4)',
        card: '0 8px 32px -8px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        nexora: {
          primary: '#8B5CF6',
          'primary-content': '#F8FAFC',
          secondary: '#22D3EE',
          'secondary-content': '#080A12',
          accent: '#34D399',
          'accent-content': '#080A12',
          neutral: '#182137',
          'neutral-content': '#F8FAFC',
          'base-100': '#0D1120',
          'base-200': '#12182A',
          'base-300': '#182137',
          'base-content': '#F8FAFC',
          info: '#22D3EE',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
          '--rounded-btn': '0.75rem',
          '--rounded-box': '1rem',
        },
      },
    ],
    darkTheme: 'nexora',
    logs: false,
  },
  plugins: [require('daisyui')],
};
