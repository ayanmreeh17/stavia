import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          50: '#EAF1EC',
          100: '#CFE0D5',
          200: '#A3C4AF',
          300: '#78A889',
          400: '#4C8C63',
          500: '#2E6B47',
          600: '#1B4332',
          700: '#153627',
          800: '#0F291D',
          900: '#0A1C13',
        },
        moss: {
          DEFAULT: '#52796F',
          light: '#84A98C',
        },
        sage: {
          DEFAULT: '#E9EFE9',
          light: '#F4F7F3',
        },
        cream: '#FBFAF6',
        brass: {
          DEFAULT: '#B8935F',
          light: '#D4B483',
        },
        charcoal: '#232420',
        ink: '#1A1B17',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        premium: '0 8px 30px -8px rgba(27, 67, 50, 0.18)',
        card: '0 2px 16px -4px rgba(27, 67, 50, 0.12)',
      },
      backgroundImage: {
        'horizon-line': 'linear-gradient(90deg, transparent, #B8935F 20%, #B8935F 80%, transparent)',
      },
    },
  },
  plugins: [],
};

export default config;
