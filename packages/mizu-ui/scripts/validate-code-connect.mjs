import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// This checks source templates against captured Figma data. It is not Figma's
// hosted evaluator; live hasTemplate status must be checked separately.
const root = fileURLToPath(new URL('..', import.meta.url));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mizu-code-connect-'));
try {
  const output = path.join(directory, 'templates.json');
  const parsed = spawnSync(process.execPath, [
    'node_modules/@figma/code-connect/dist/cli.js', 'connect', 'parse',
    '--config', 'figma.keynote.config.json', '--skip-update-check',
    '--exit-on-unreadable-files', '--outFile', output,
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr || parsed.stdout);
  const docs = JSON.parse(fs.readFileSync(output, 'utf8'));
  const contexts = JSON.parse(fs.readFileSync(path.join(root, 'code-connect/keynote/context.json'), 'utf8'));
  const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'code-connect/keynote/fixtures.json'), 'utf8'));
  assert.equal(docs.length, contexts.length);
  assert.equal(docs.length, 30);
  const byId = new Map(docs.map(doc => [new URL(doc.figmaNode).searchParams.get('node-id').replace('-', ':'), doc]));
  for (const context of contexts) assert.ok(byId.has(context.nodeId), context.component);
  const imports = new Set();
  const errors = [];
  const examples = [];
  const coverage = new Map();
  const errorHandle = { type: 'ERROR' };
  const render = value => {
    if (value == null) return '';
    if (Array.isArray(value)) return value.map(render).join('');
    if (value.type === 'CODE') return value.code;
    if (value.type === 'SECTIONS') return render(value.sections);
    if (typeof value === 'object') throw new Error('Template interpolated a non-code object');
    return String(value);
  };
  const tag = (strings, ...values) => ({ type: 'SECTIONS', sections: [{
    type: 'CODE', code: strings.reduce((code, part, index) => code + part + (index < values.length ? render(values[index]) : ''), ''),
  }] });
  function evaluate(data) {
    const doc = byId.get(data.mainId);
    assert.ok(doc, `Missing nested template for ${data.mainId}`);
    assert.equal(doc.templateData.isParserless, true);
    assert.equal(doc.templateData.nestable, true);
    const handle = wrap(data);
    const figma = { selectedInstance: handle, code: tag };
    const compiled = ts.transpileModule(doc.template, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(compiled, { module, exports: module.exports, require: name => {
      assert.equal(name, 'figma'); return figma;
    } }, { timeout: 1000, filename: doc.component + '.figma.ts' });
    const result = module.exports.default;
    for (const item of result.imports || []) imports.add(item);
    return { example: result.example.sections || result.example, metadata: result.metadata };
  }
  function wrap(data) {
    if (data.type === 'TEXT') return data;
    function get(name) {
      const key = Object.keys(data.properties).find(key => key === name || key.split('#')[0] === name);
      assert.ok(key, `Missing property ${name} on ${data.mainId}`);
      if (!coverage.has(data.mainId)) coverage.set(data.mainId, new Set());
      coverage.get(data.mainId).add(name);
      return data.properties[key].value;
    }
    function search(predicate, options = {}) {
      const result = [];
      function visit(node) {
        for (const child of node.children || []) {
          const handle = wrap(child);
          if (predicate(handle)) result.push(handle);
          if (child.type !== 'INSTANCE' || options.traverseInstances) visit(child);
        }
      }
      visit(data); return result;
    }
    return {
      ...data,
      getString: name => String(get(name)),
      getBoolean: name => {
        const value = get(name); assert.equal(typeof value, 'boolean'); return value;
      },
      getEnum: (name, options) => {
        const value = get(name);
        assert.ok(Object.hasOwn(options, value), `Unmapped ${name}=${value} on ${data.mainId}`);
        return options[value];
      },
      getInstanceSwap: name => {
        const id = String(get(name));
        return search(node => node.type === 'INSTANCE' && (node.id === id || node.mainId === id))[0] || errorHandle;
      },
      findText: (name, options) => search(node => node.type === 'TEXT' && node.name === name, options)[0] || errorHandle,
      findInstance: (name, options) => search(node => node.type === 'INSTANCE' && node.name === name, options)[0] || errorHandle,
      findLayers: (predicate, options) => search(predicate, options),
      executeTemplate: () => evaluate(data),
    };
  }
  function check(data, name) {
    try {
      const code = render(evaluate(data).example);
      assert.doesNotMatch(code, /\[object Object\]|\bundefined\b/);
      examples.push(`// ${name}\nexport const Example${examples.length} = () => (${code});`);
      return code;
    } catch (error) { errors.push(`${name}: ${error.message}`); }
  }
  for (const fixture of fixtures) check(fixture, `${fixture.mainId} ${fixture.name}`);
  // Exercise instance swaps, text escaping, and boolean branches beyond defaults.
  const button = structuredClone(fixtures.find(item => item.mainId === '13:187'));
  button.properties['Show icon#13:55'].value = true;
  button.properties['Label#13:56'].value = 'Save "koi" <draft> & 水\nnext line';
  const buttonCode = check(button, 'button: visible swapped icon and escaped text');
  assert.match(buttonCode, /IconPlus/);
  for (const media of ['16:181', '16:183', '16:185']) {
    const card = structuredClone(fixtures.find(item => item.mainId === '16:234'));
    card.properties['Media#16:30'].value = media;
    card.children.find(item => item.type === 'INSTANCE' && item.mainId === '16:181').mainId = media;
    const code = check(card, `card: media swap ${media}`);
    assert.match(code, /media=\{<Media/);
  }
  const dialog = structuredClone(fixtures.find(item => item.mainId === '16:491'));
  dialog.properties['Body#16:60'].value = '16:539';
  dialog.children = [structuredClone(fixtures.find(item => item.mainId === '16:539'))];
  assert.match(check(dialog, 'dialog: swapped specimen details'), /body=\{<SpecimenDetails/);
  for (const context of contexts) {
    for (const definition of Object.values(context.properties)) {
      assert.ok(coverage.get(context.nodeId)?.has(definition.name), `Unread Figma property ${context.component}.${definition.name}`);
    }
  }
  assert.deepEqual(errors, []);
  const generated = [...imports, ...examples].join('\n');
  const filename = path.join(root, 'code-connect/keynote/.generated-snippets.tsx');
  const options = {
    strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true,
    esModuleInterop: true, baseUrl: root, paths: { '@mizu/ui': ['./src/index.ts'] },
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host), fileExists = host.fileExists.bind(host);
  host.readFile = file => file === filename ? generated : readFile(file);
  host.fileExists = file => file === filename || fileExists(file);
  host.getSourceFile = (file, languageVersion) => {
    const contents = host.readFile(file);
    return contents === undefined ? undefined : ts.createSourceFile(file, contents, languageVersion, true);
  };
  const program = ts.createProgram([filename], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    fs.writeFileSync(path.join(directory, 'snippets.tsx'), generated);
    throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: name => name, getCurrentDirectory: () => root, getNewLine: () => '\n',
    }));
  }
  console.log(`Validated ${docs.length} templates, ${fixtures.length} captured variants/standalone components, ${examples.length - fixtures.length} override scenarios, all exposed properties, and generated JSX against current component props.`);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
