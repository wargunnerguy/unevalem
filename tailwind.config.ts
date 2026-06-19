import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        midnight: 'var(--color-midnight)',
        dusk: 'var(--color-dusk)',
        lavender: 'var(--color-lavender)',
        moonlight: 'var(--color-moonlight)',
        foam: 'var(--color-foam)',
        gold: 'var(--color-gold)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
} satisfies Config
