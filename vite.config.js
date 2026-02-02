import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Set the limit to 1000kb to stop the warning
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 2. Separate node_modules into a vendor chunk for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})