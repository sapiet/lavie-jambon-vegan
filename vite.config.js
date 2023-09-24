import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: `${process.env.BASE_URL || ''}`,
  build: {
    outDir: 'docs'
  }
})
