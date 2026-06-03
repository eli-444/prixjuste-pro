import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcff',
          100: '#d7f8ff',
          500: '#0ea5ff',
          600: '#0878f2',
          900: '#061747',
        },
        aqua: {
          50: '#ecfffd',
          100: '#ccfbf6',
          500: '#11cfc2',
          600: '#0aaea8',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(6, 23, 71, 0.12)',
        glow: '0 24px 80px rgba(14, 165, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
export default config;
