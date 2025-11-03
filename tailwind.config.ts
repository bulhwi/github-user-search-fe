import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // MUI와의 충돌 방지를 위한 설정
  important: '#__next',
  theme: {
    extend: {
      screens: {
        sm: '600px',  // MUI small
        md: '900px',  // MUI medium
        lg: '1200px', // MUI large
        xl: '1536px', // MUI extra-large
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Noto Sans',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
  // MUI의 기본 스타일 보호
  corePlugins: {
    preflight: false,
  },
}
export default config