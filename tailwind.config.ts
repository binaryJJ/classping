import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'w-primary': '#F4547A',
        'w-primary-hover': '#e03d66',
        'w-heading': '#171719',
        'w-body': '#333333',
        'w-surface': '#FFFFFF',
        'w-subtle': '#FFF5F7',
        'w-error': '#F0483C',
        'w-success': '#00B97C',
        'w-warning': '#FFAB00',
        'kakao': '#FEE500',
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
