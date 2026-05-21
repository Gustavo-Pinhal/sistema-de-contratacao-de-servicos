import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Permite acesso externo ao container
    port: 5173,
    strictPort: true, // Força o erro se a porta estiver ocupada, em vez de mudar para 5174
    hmr: {
      clientPort: 443, // Importante: informa ao browser para conectar o HMR via porta HTTPS do Nginx
    },
    watch: {
      usePolling: true, // Necessário para detectar mudanças de arquivos em volumes Docker
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})