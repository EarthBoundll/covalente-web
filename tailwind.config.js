/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        c: {
          bg:      '#0D0D1A',
          bg2:     '#13132A',
          bg3:     '#1A1A35',
          accent:  '#7B2FBE',
          accent2: '#A855F7',
          accent3: '#C084FC',
          text:    '#E8E8FF',
          muted:   '#9090B8',
        },
      },
    },
  },
  plugins: [],
}
