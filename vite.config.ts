import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sorting-visualiser/', // must match your repo name (with leading & trailing slash)
})
