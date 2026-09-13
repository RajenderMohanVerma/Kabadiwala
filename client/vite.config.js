import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['kabadivala_recycle_icon_accurate.svg'],
    manifest: {
      name: 'Kabadivala',
      short_name: 'Kabadivala',
      description: 'From local collection to responsible recycling',
      theme_color: '#0c2e24',
      background_color: '#f5f7f2',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/kabadivala_recycle_icon_accurate.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    }
  })],
  server: { port: 5173 }
})
