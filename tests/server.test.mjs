import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let server, base;
before(async () => {
  server=spawn(process.execPath,['server.mjs'],{cwd:fileURLToPath(new URL('..',import.meta.url)),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  base=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Preview server did not start')),5000);
    server.stdout.on('data',data=>{const url=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];if(url){clearTimeout(timeout);resolve(url);}});
    server.on('error',error=>{clearTimeout(timeout);reject(error);});
    server.on('exit',code=>{clearTimeout(timeout);reject(new Error(`Preview exited with ${code}`));});
  });
});
after(()=>server?.kill());

test('homepage and every local HTML asset load successfully', async()=>{
  const response=await fetch(base);
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-type'),/text\/html/);
  const html=await response.text();
  const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]).filter(value=>!value.startsWith('#')&&!value.startsWith('data:'));
  for(const asset of new Set(assets))assert.equal((await fetch(`${base}/${asset}`)).status,200,asset);
});

test('all modules and generated images are served with browser-readable types',async()=>{
  for(const [file,type] of [['app.js','text/javascript'],['model.js','text/javascript'],['pond.js','text/javascript'],['assets/catalog.png','image/png'],['assets/pond.png','image/png'],['assets/pond-mobile.png','image/png'],['assets/kohaku.png','image/png']]){
    const response=await fetch(`${base}/${file}`);
    assert.equal(response.status,200,file);
    assert.ok(response.headers.get('content-type').startsWith(type),file);
    assert.ok((await response.arrayBuffer()).byteLength>0,file);
  }
});

test('invalid resources and traversal cannot resolve outside the deliverable',async()=>{
  for(const route of ['/does-not-exist','/%2e%2e%2fpackage.json','/assets/'])assert.equal((await fetch(`${base}${route}`)).status,404,route);
  assert.equal((await fetch(base,{method:'POST',body:'no writes'})).status,405);
});

test('HEAD serves metadata without a body',async()=>{
  const response=await fetch(base,{method:'HEAD'});
  assert.equal(response.status,200);
  assert.equal(await response.text(),'');
});
