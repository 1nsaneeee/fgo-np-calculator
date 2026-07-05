import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function nojekyllPlugin() {
  return {
    name: 'nojekyll',
    writeBundle() {
      fs.writeFileSync(path.resolve(__dirname, 'docs', '.nojekyll'), '');
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), nojekyllPlugin()],
  base: command === 'build' ? '/fgo-np-calculator/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-recharts': ['recharts'],
        },
      },
    },
  },
}));
