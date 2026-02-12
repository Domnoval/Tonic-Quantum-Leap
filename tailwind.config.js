/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        mono: ['Inter', 'monospace'],
      },
      colors: {
        void: '#0a0a0a',
        'void-deep': '#050505',
        source: '#F5F5F5',
        gold: { DEFAULT: '#C9A84C', bright: '#d4af37', dim: '#8a7030' },
        'deep-purple': '#1a0a2e',
        teal: '#0d9488',
        ruby: '#9f1239',
        amethyst: '#7c3aed',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
        'drift': 'drift 60s linear infinite alternate',
        'grid-glitch': 'grid-glitch 5s infinite linear',
        'orbital-ripple': 'orbital-ripple 8s infinite linear',
        'spectral-shift': 'spectral-shift 12s linear infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        'drift': {
          from: { transform: 'translate(0, 0)' },
          to: { transform: 'translate(-10%, -10%)' },
        },
        'grid-glitch': {
          '0%, 92%': { opacity: '0', transform: 'translateX(0)', filter: 'none' },
          '93%': { opacity: '0.6', transform: 'translateX(4px)', filter: 'hue-rotate(90deg) contrast(1.5)' },
          '94%': { opacity: '0.6', transform: 'translateX(-4px)', filter: 'hue-rotate(-90deg) contrast(1.5)' },
          '95%, 100%': { opacity: '0', transform: 'translateX(0)', filter: 'none' },
        },
        'orbital-ripple': {
          '0%': { transform: 'scale(0.1)', opacity: '0', borderWidth: '4px' },
          '20%': { opacity: '0.3' },
          '100%': { transform: 'scale(1)', opacity: '0', borderWidth: '0px' },
        },
        'spectral-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'decohere': {
          '0%': { opacity: '1', transform: 'scale(1) translateZ(0)', filter: 'blur(0px) hue-rotate(0deg) brightness(1)' },
          '30%': { transform: 'scale(1.02) skewX(2deg) translateZ(20px)', filter: 'blur(2px) hue-rotate(45deg) contrast(1.5) brightness(1.2)' },
          '100%': { opacity: '0', transform: 'scale(1.5) translateZ(100px)', filter: 'blur(20px) hue-rotate(180deg) brightness(10) contrast(2)' },
        },
        'rematerialize': {
          '0%': { opacity: '0', transform: 'scale(0.9) translateZ(-50px)', filter: 'blur(20px) grayscale(1) brightness(0)' },
          '60%': { opacity: '0.8', transform: 'scale(1.01) translateZ(10px)', filter: 'blur(2px) grayscale(0.5) brightness(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1) translateZ(0)', filter: 'blur(0px) grayscale(0) brightness(1)' },
        },
      },
    },
  },
  plugins: [],
}
