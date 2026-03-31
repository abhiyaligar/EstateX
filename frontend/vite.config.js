import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all local IPs
    cors: true, // Allow all cross-origin requests
    strictPort: true, // Fail if port is in use
  }
})
