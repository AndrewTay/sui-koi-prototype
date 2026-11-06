import marketplace from './marketplace/vite.config.mjs';
import { fileURLToPath } from 'node:url';

export default {
  resolve: marketplace.resolve,
  esbuild: marketplace.esbuild,
  plugins: [{
    name: 'mizu-marketplace-development-entry',
    enforce: 'pre',
    resolveId(source) {
      const pathname = source.split('?')[0];
      if (pathname === './marketplace-dist/marketplace.js' || pathname === '/marketplace-dist/marketplace.js') {
        return fileURLToPath(new URL('./marketplace/main.tsx', import.meta.url));
      }
    },
    transformIndexHtml(html) { return html.replace('  <link rel="stylesheet" href="marketplace-dist/marketplace.css">', ''); },
  }],
};
