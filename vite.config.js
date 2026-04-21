import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["react-day-picker"],
    },
  },
  plugins: [
    react(),
    tailwindcss()
  ]
})