import { readFile, writeFile } from 'node:fs/promises';

const collections = JSON.parse(await readFile(new URL('../tokens/figma.json', import.meta.url), 'utf8'));
const byId = new Map(collections.flatMap(collection => collection.variables.map(variable => [variable.id, variable])));

function valueOf(variable, modeId) {
  const value = variable.values[modeId];
  if (value?.type === 'VARIABLE_ALIAS') return `var(${byId.get(value.id).css.slice(4, -1)})`;
  if (variable.type === 'COLOR') {
    const channels = [value.r, value.g, value.b].map(channel => Math.round(channel * 255));
    return value.a === 1 ? `rgb(${channels.join(' ')})` : `rgb(${channels.join(' ')} / ${Number(value.a.toFixed(3))})`;
  }
  if (typeof value === 'number') {
    return `${Number(value.toFixed(3))}px`;
  }
  if (variable.name.endsWith('/family')) return `"${value}", Arial, sans-serif`;
  return String(value);
}

const primitive = collections.find(collection => collection.name.endsWith('Primitives'));
const color = collections.find(collection => collection.name.endsWith('Color'));
const dimensions = collections.find(collection => collection.name.endsWith('Dimensions'));
const typography = collections.find(collection => collection.name.endsWith('Typography'));
const declaration = (variable, modeId) => {
  // Figma exported both a focus-border color and width with the same WEB code syntax.
  const name = variable.name === 'border/focus' ? '--sui-border-focus-width' : variable.css.slice(4, -1);
  return `  ${name}: ${valueOf(variable, modeId)};`;
};
const block = (selector, collectionsWithModes) => `${selector} {\n${collectionsWithModes.flatMap(([collection, modeId]) => collection.variables.map(variable => declaration(variable, modeId))).join('\n')}\n}`;
const output = [
  '/* Generated from tokens/figma.json. Edit the source manifest, then run npm run tokens. */',
  block(':root', [[primitive, primitive.modes[0].modeId], [dimensions, dimensions.modes[0].modeId], [typography, typography.modes[0].modeId], [color, color.modes[0].modeId]]),
  block('[data-mizu-theme="pond"]', [[color, color.modes[1].modeId]]),
  ''
].join('\n\n');
await writeFile(new URL('../src/tokens.css', import.meta.url), `${output.trimEnd()}\n`);
