import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // `npm test` — see src/test/ and the *.test.js(x) files next to the code
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
