import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { readFileSync } from 'fs'

const manifest = JSON.parse(readFileSync('./app/manifest.json', 'utf-8')) as Record<string, unknown>

export default defineConfig({
  root: 'app',
  plugins: [
    crx({ manifest }),
    viteStaticCopy({
      targets: [{ src: '_locales', dest: '.' }]
    })
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
