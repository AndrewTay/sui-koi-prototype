import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from '../packages/mizu-ui/node_modules/vite/dist/node/index.js';

test('development loads marketplace source and its styles instead of the static bundle', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'error',
  });
  try {
    await server.listen();
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    const html = await (await fetch(base)).text();
    assert.doesNotMatch(html, /href="marketplace-dist\/marketplace.css"/);
    const app = await (await fetch(`${base}/app.js`)).text();
    assert.match(app, /import "\/marketplace\/main.tsx"/);
    const marketplace = await (await fetch(`${base}/marketplace/main.tsx`)).text();
    for (const path of ['/marketplace/styles.css', '/packages/mizu-ui/src/styles.css', '/packages/mizu-ui/src/tokens.css']) {
      assert.ok(marketplace.includes(path), `Missing stylesheet import: ${path}`);
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 200, path);
      assert.ok((await response.text()).length > 0, path);
    }
  } finally {
    await server.close();
  }
});
