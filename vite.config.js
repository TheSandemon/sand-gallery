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
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem - include react-grid-layout to prevent dual React
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-grid-layout'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Wallet/Web3 (large - lazy load via dynamic imports in code)
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
