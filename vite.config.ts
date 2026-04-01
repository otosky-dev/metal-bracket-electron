import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const isWeb = process.env.BUILD_TARGET === 'web'

export default defineConfig(async () => {
  const plugins = [vue(), tailwindcss()]

  if (isWeb) {
    const { VitePWA } = await import('vite-plugin-pwa')
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'Doomocracy',
          short_name: 'Doomocracy',
          description: 'Tournoi de brackets pour élire le meilleur album metal de l\'année',
          theme_color: '#1a1a1a',
          background_color: '#0a0a0a',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      })
    )
  } else {
    const electronPlugin = await import('vite-plugin-electron/simple')
    plugins.push(
      electronPlugin.default({
        main: {
          entry: 'electron/main.ts',
        },
        preload: {
          input: 'electron/preload.ts',
        },
      })
    )
  }

  return { plugins }
})
