import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

const commitDate = execSync('git log -1 --format=%cd').toString().trim()
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
const versionString = `${commitDate} (${commitHash})`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force react-grid-layout to use the main React
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  ssr: {
    // Force react-grid-layout to be bundled, not externalized
    noExternal: ['react-grid-layout'],
  },
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
