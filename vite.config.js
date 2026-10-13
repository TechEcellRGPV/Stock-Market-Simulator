import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_D.png', 'logo.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Imprenditore 5.0 - Stock Market Simulation | E-Cell RGPV',
        short_name: 'Imprenditore 5.0',
        description: 'High-concurrency Formula 1 simulated trading platform by E-Cell RGPV Bhopal.',
        theme_color: '#0A0D12',
        background_color: '#0A0D12',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/logo_D.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo_D.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 15,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
