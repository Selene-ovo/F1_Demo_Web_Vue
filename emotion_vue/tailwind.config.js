/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // F1 메인 컬러
        'f1-red': '#dc2626',
        'f1-dark': '#1f2937',
        'f1-white': '#ffffff',
        
        // 포디움 컬러
        'gold': '#fbbf24',
        'silver': '#9ca3af',
        'bronze': '#d97706',
        
        // 팀 컬러
        'red-bull': '#1e3a5f',
        'ferrari': '#dc143c',
        'mclaren': '#ff8700',
        'mercedes': '#00d2be',
        'alpine': '#0090ff',
        'aston-martin': '#006f62',
        'williams': '#005aff',
        'alfa-romeo': '#900000',
        'haas': '#ffffff',
        'alphatauri': '#2b4562',
        
        // 커스텀 배경
        'f1-bg-dark': '#0f172a',
        'f1-surface': '#1e293b',
        'f1-text': '#f1f5f9',
        'f1-accent': '#dc2626',
      },
      fontFamily: {
        'racing': ['Racing Sans One', 'cursive'],
        'f1': ['Orbitron', 'monospace'],
        'korean': ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink-caret .75s step-end infinite',
        'counter': 'counter 2s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        'blink-caret': {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': '#dc2626' }
        },
        counter: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(-100%)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        }
      },
      backgroundImage: {
        'f1-gradient': 'linear-gradient(135deg, #dc2626 0%, #1f2937 100%)',
        'podium-gradient': 'linear-gradient(45deg, #fbbf24 0%, #d97706 50%, #9ca3af 100%)',
        'circuit-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      },
      boxShadow: {
        'f1': '0 10px 25px rgba(220, 38, 38, 0.2)',
        'podium': '0 15px 35px rgba(251, 191, 36, 0.3)',
        'dark-glow': '0 0 20px rgba(220, 38, 38, 0.5)',
      }
    },
  },
  plugins: [],
}