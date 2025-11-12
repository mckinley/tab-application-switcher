import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { readFileSync } from 'fs'

const manifest = JSON.parse(readFileSync('./app/manifest.json', 'utf-8'))

export default defineConfig(({ mode }) => ({
  root: 'app',
  publicDir: 'public',
  plugins: [
    crx({ manifest }),
    viteStaticCopy({
      targets: [
        {
          src: '_locales',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep CSS in styles directory
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  define: {
    // Remove dev-only code in production
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}))
