import { cp, mkdir } from 'node:fs/promises';

await mkdir(new URL('../dist/assets/', import.meta.url), { recursive: true });
await cp(new URL('../src/assets/', import.meta.url), new URL('../dist/assets/', import.meta.url), { recursive: true });
await cp(new URL('../src/styles.css', import.meta.url), new URL('../dist/styles.css', import.meta.url));
await cp(new URL('../src/tokens.css', import.meta.url), new URL('../dist/tokens.css', import.meta.url));
