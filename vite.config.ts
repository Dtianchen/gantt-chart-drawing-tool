import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    '__APP_VERSION__': JSON.stringify(pkg.version)
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-lucide': ['lucide-react'],
          'vendor-xlsx': ['xlsx'],
          'vendor-html-to-image': ['html-to-image'],
          'vendor-dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-dayjs': ['dayjs'],
        },
      },
    },
  }
})
