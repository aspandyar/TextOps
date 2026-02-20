import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: repo is served at https://<user>.github.io/<repo>/
export default defineConfig({
  // Use repo subpath on GitHub Pages (match your GitHub repo name)
  base: process.env.GITHUB_ACTIONS === 'true' ? '/TextOps/' : '/',
  plugins: [react()],
  build: {
    // Avoid source map requests that can return non-JSON (e.g. 404 HTML) and cause
    // "Source map error: JSON.parse: unexpected character" in DevTools.
    sourcemap: false,
  },
})
