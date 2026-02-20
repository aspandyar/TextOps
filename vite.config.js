import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Avoid source map requests that can return non-JSON (e.g. 404 HTML) and cause
    // "Source map error: JSON.parse: unexpected character" in DevTools.
    sourcemap: false,
  },
})
