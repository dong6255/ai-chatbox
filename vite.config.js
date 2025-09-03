import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // host: '0.0.0.0', // 监听所有地址
    proxy: {
      '/api': {
        target: 'http://www.pxjzpt.ln/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    vue(),
  ],
    // 设置scss的api类型为modern-compiler
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler'
          }
        }
      },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
