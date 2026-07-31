import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { base: '#0B0E14', surface: '#131720', elevated: '#1B2130' },
        text: { primary: '#E6E9EF', muted: '#8A93A6' },
        accent: '#3B82F6',
        bull: '#16C784',
        bear: '#EA3943',
        warn: '#F0B90B',
      },
      borderRadius: { md: '0.375rem' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
