import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const commitDate = execSync('git log -1 --format=%cd').toString().trim()
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
const versionString = `${commitDate} (${commitHash})`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(versionString),
  },
  build: {
    // Let Vite handle all chunking - don't force any manual chunks
    // This prevents dual React initialization issues
  },
})
