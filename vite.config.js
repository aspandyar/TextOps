import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path: VITE_BASE_PATH in CI = /repo-name/ (e.g. aspandyar.me/TextOps/). Dev uses '/'
const base =
  process.env.VITE_BASE_PATH !== undefined && process.env.VITE_BASE_PATH !== ''
    ? process.env.VITE_BASE_PATH
    : '/'
export default defineConfig({
  base,
  plugins: [react()],
  build: {
    // Avoid source map requests that can return non-JSON (e.g. 404 HTML) and cause
    // "Source map error: JSON.parse: unexpected character" in DevTools.
    sourcemap: false,
  },
})
