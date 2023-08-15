import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint(), viteTsconfigPaths(), svgrPlugin()],
  server: {
    open: true, // Automatically open in browser when developing
    port: process.env.VITE_RUN_IN_CI == 'true' ? 3001 : 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://backend:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})
