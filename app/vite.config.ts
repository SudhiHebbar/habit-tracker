import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Enable CSS Modules for .module.css files
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
  },
  resolve: {
    alias: {
      // Add path aliases for clean imports
      '@': '/src',
      '@features': '/src/features',
      '@shared': '/src/shared',
      '@styles': '/styles',
    },
  },
})
