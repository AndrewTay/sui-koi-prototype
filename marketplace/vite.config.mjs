import { defineConfig } from '../packages/mizu-ui/node_modules/vite/dist/node/index.js';
import { fileURLToPath } from 'node:url';

const path = relative => fileURLToPath(new URL(relative, import.meta.url));
export default defineConfig({
  base: '/marketplace-dist/',
  resolve: { alias: {
    'react-dom': path('../packages/mizu-ui/node_modules/react-dom'),
    react: path('../packages/mizu-ui/node_modules/react'),
  } },
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: path('../marketplace-dist'), emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: { input: path('./main.tsx'), output: { entryFileNames: 'marketplace.js', assetFileNames: asset => asset.names?.some(name => name.endsWith('.css')) ? 'marketplace.css' : 'assets/[name]-[hash][extname]' } },
  },
});
