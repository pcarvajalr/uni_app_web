import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Necesario para Capacitor live reload
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'tanstack-vendor': ['@tanstack/react-query'],
          'charts-vendor': ['recharts'],
          'documents-vendor': ['jspdf', 'docx'],
          'capacitor-vendor': [
            '@capacitor/app',
            '@capacitor/camera',
            '@capacitor/core',
            '@capacitor/filesystem',
            '@capacitor/geolocation',
            '@capacitor/haptics',
            '@capacitor/network',
            '@capacitor/preferences',
            '@capacitor/push-notifications',
            '@capacitor/share',
            '@capacitor/splash-screen',
            '@capacitor/status-bar',
            '@capacitor/toast',
          ],
        },
      },
    },
  },
})
