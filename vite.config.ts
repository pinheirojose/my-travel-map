import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function vendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) return
  const rest = id.split('node_modules/').pop()
  if (!rest) return
  const parts = rest.split('/')
  const name = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]

  if (
    name === 'leaflet' ||
    name === 'react-leaflet' ||
    name === '@react-leaflet/core'
  ) {
    return 'leaflet'
  }
  if (name === 'framer-motion') return 'motion'
  if (name === 'html-to-image') return 'html-to-image'
  if (name.startsWith('@radix-ui')) return 'radix'
  if (name === 'lucide-react') return 'icons'
  if (name === 'react' || name === 'react-dom' || name === 'scheduler') {
    return 'react'
  }
  return 'vendor'
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          return vendorChunk(id)
        },
      },
    },
  },
})
