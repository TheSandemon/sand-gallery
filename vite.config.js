import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const commitDate = execSync('git log -1 --format=%cd').toString().trim()
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
const versionString = `${commitDate} (${commitHash})`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force consistent React version across all dependencies
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(versionString),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split wallet - keep everything else together
          'vendor-wallet': [
            '@coinbase/wallet-sdk',
            'viem',
            'wagmi',
          ],
        },
      },
    },
  },
})
