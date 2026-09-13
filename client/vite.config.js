import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
    manifest: {
      name: 'Kabadivala',
      short_name: 'Kabadivala',
      description: 'From local collection to responsible recycling',
      theme_color: '#0c2e24',
      background_color: '#f5f7f2',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    }
  })],
  server: { port: 5173 }
})
