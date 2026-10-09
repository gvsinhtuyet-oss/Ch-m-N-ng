import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {firestoreConfiguration, MAIN_FIRESTORE_DATABASE} from './deployment-config.mjs';

test('uses exactly the requested database with no fallback to production',()=>{
  assert.deepEqual(firestoreConfiguration({CHAM_ENV:'test',AUTH_FIRESTORE_PROJECT:'test-project',AUTH_FIRESTORE_DATABASE:'test-db'}),
    {project:'test-project',database:'test-db',candidates:['test-db']});
  assert.equal(firestoreConfiguration({}).database,MAIN_FIRESTORE_DATABASE);
});
test('test deployment refuses missing configuration and the main database',()=>{
  for(const env of [{},{AUTH_FIRESTORE_PROJECT:'test-project'},
    {AUTH_FIRESTORE_PROJECT:'test-project',AUTH_FIRESTORE_DATABASE:MAIN_FIRESTORE_DATABASE},
    {AUTH_FIRESTORE_DATABASE:'test-db'}])assert.throws(()=>firestoreConfiguration({...env,CHAM_ENV:'test'}));
});
test('Docker runtime includes every local module imported by the production server',async()=>{
  const docker=await readFile(new URL('./Dockerfile',import.meta.url),'utf8');
  const runtime=docker.split('AS runtime')[1];
  const copied=[...runtime.matchAll(/^COPY (?!.*--from)(.+) \.\/$/gm)].flatMap(m=>m[1].split(/\s+/));
  const checked=new Set();
  const inspect=async file=>{
    if(checked.has(file))return;checked.add(file);
    assert.ok(copied.includes(file),`Docker runtime is missing ${file}`);
    const source=await readFile(new URL('./'+file,import.meta.url),'utf8');
    for(const match of source.matchAll(/(?:from\s+|import\s*\(\s*)['"]\.\/([^'"]+\.mjs)['"]/g))await inspect(match[1]);
  };
  await inspect('content-server.mjs');
  assert.ok(checked.has('gddp-catalog.mjs'));
  assert.ok(checked.has('gddp-ai.mjs'));
  assert.ok(checked.has('deployment-config.mjs'));
});

test('Cloud Run runtime packages the self-contained five-grade GDĐP module',async()=>{
  const docker=await readFile(new URL('./Dockerfile',import.meta.url),'utf8');
  const server=await readFile(new URL('./content-server.mjs',import.meta.url),'utf8');
  assert.ok(docker.includes('gddp-bundled-data.mjs'));
  assert.ok(server.includes("import { bundledGddpData } from './gddp-bundled-data.mjs'"));
  assert.ok(!server.includes("readFile(new URL('./content-data/gddp-2026-2027.json'"));
  const {bundledGddpData}=await import('./gddp-bundled-data.mjs');
  assert.equal(bundledGddpData.records.length,42);
  assert.deepEqual([1,2,3,4,5].map(g=>bundledGddpData.records.filter(x=>x.grade===g).length),[7,8,10,9,8]);
});
