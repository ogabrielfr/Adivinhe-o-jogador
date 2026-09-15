import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base precisa bater com o nome do repositorio para o GitHub Pages servir os assets
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Adivinhe-o-jogador/' : '/',
  plugins: [react(), tailwindcss()],
})
