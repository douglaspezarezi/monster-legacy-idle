import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos: o jogo abre em qualquer subpasta, como a do GitHub Pages.
  base: './',
  plugins: [react()],
})
