import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lotu',
        short_name: 'Lotu',
        start_url: '.',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#3EFEFE',
        description: 'Location de véhicules Lotu',
        icons: [
          {
            src: '/logo 192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo 512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
