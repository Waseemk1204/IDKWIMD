/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional LinkedIn-inspired color system
        primary: {
          50: '#e7f3ff',
          100: '#d0e7ff',
          200: '#a8d4ff',
          300: '#7ab8f5',
          400: '#4d9de8',
          500: '#0A66C2', // LinkedIn Blue - main brand color
          600: '#095399',
          700: '#084073',
          800: '#062e52',
          900: '#041f38',
          950: '#021426',
        },
        // Success green for verification, earnings, positive actions
        success: {
          50: '#e6f7ed',
          100: '#ccefdb',
          200: '#99dfb7',
          300: '#66cf93',
          400: '#33bf6f',
          500: '#057642', // Professional green
          600: '#045e35',
          700: '#034728',
          800: '#022f1a',
          900: '#01180d',
          950: '#000c06',
        },
        // Error red for warnings and critical actions
        error: {
          50: '#ffeaea',
          100: '#ffd5d5',
          200: '#ffabab',
          300: '#ff8181',
          400: '#ff5757',
          500: '#CC1016', // Clear professional red
          600: '#a30d12',
          700: '#7a0a0d',
          800: '#520609',
          900: '#290304',
          950: '#140102',
        },
        // Warning amber for notifications
        warning: {
          50: '#fef6e7',
          100: '#fdedcf',
          200: '#fbdb9f',
          300: '#f9c96f',
          400: '#f7b73f',
          500: '#F5A623', // Professional amber
          600: '#c4851c',
          700: '#936415',
          800: '#62420e',
          900: '#312107',
          950: '#181103',
        },
        // Professional gray scale - the backbone of the design
        gray: {
          50: '#FAFAFA',   // Lightest background
          100: '#F3F2EF',  // Light surface (LinkedIn-inspired)
          200: '#E0DFDC',  // Subtle borders
          300: '#CFCDC9',  // Light borders
          400: '#999999',  // Secondary text
          500: '#666666',  // Primary text (light mode)
          600: '#4D4D4D',  // Darker text
          700: '#333333',  // Very dark text
          800: '#1B1F23',  // Dark surface
          900: '#0A0A0A',  // Near black
          950: '#000000',  // True black for dark mode
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Simplified professional typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Labels, badges
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Meta information
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body text (default)
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - Card titles
        'xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px - Section titles
        '2xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px - Page titles
        '3xl': ['3rem', { lineHeight: '3.5rem' }],      // 48px - Hero headlines
      },
      spacing: {
        // 4px unit system for consistent spacing
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'container': '1200px', // Standard container width
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        // Simplified professional shadow system
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',          // Subtle elevation
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',       // Standard elevation
        'lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',     // High elevation
      },
      animation: {
        // Minimal, professional animations only
        'fade-in': 'fadeIn 0.2s ease',
        'slide-in': 'slideIn 0.3s ease-out',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}