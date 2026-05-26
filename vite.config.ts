import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config to improve bundling for production builds.
// - Split large vendor bundles into logical chunks
// - Increase chunkSizeWarningLimit to avoid noisy warnings
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor.react'
            if (id.includes('@supabase') || id.includes('supabase')) return 'vendor.supabase'
            if (id.includes('framer-motion')) return 'vendor.motion'
            if (id.includes('lucide-react')) return 'vendor.icons'
            return 'vendor'
          }
        },
      },
    },
  },
})

