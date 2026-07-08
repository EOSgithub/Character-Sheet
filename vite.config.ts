import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to GitHub Pages at /Character-Sheet/
export default defineConfig({
  plugins: [react()],
  base: '/Character-Sheet/',
})
