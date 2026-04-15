import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'Edash Planner',
        short_name: 'Edash',
        theme_color: '#556B2F',
        background_color: '#F5F5F0',
        display: 'standalone',
      }
    })
  ]
}
