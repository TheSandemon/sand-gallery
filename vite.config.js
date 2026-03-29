import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

let commitDate = 'unknown'
let commitHash = 'unknown'
try {
  commitDate = execSync('git log -1 --format=%cd').toString().trim()
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // Build environment may not have git
}
const versionString = `${commitDate} (${commitHash})`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(versionString),
  },
})
