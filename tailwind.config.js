/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-sage',
    'bg-sage-dark',
    'bg-sage-light',
    'bg-sage-muted',
    'hover:bg-sage-dark',
    'text-sage',
    'text-sage-dark',
    'text-sage-light',
    'border-sage',
    'border-sage-muted',
    'ring-sage',
    'bg-earth',
    'bg-earth-dark',
    'hover:bg-earth-dark',
    'text-earth',
    'text-earth-dark',
  ],
  theme: {
    extend: {
      colors: {
        // Magari & Co. Brand Colors - Inspired by McGee & Co / Amber Lewis
        cream: {
          DEFAULT: '#F7F4F0',
          light: '#FDFCFB',
          dark: '#EFE9E3',
        },
        sage: {
          DEFAULT: '#6B7C70',
          light: '#9BA89F',
          dark: '#4A5A4E',
          muted: '#B8C5BA',
        },
        taupe: {
          DEFAULT: '#C2B5A8',
          light: '#D9CFC5',
          dark: '#A3958A',
        },
        greige: {
          DEFAULT: '#BFBAAF',
          light: '#D6D3CA',
          dark: '#9B9589',
        },
        earth: {
          DEFAULT: '#A0927C',
          light: '#C4B8A5',
          dark: '#7D6F5C',
        },
        stone: {
          DEFAULT: '#8C8279',
          light: '#ABA49C',
          dark: '#6B635C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

