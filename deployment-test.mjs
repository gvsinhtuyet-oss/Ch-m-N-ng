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

test('Docker build ships the five-grade GDĐP catalog in the runtime image',async()=>{
  const docker=await readFile(new URL('./Dockerfile',import.meta.url),'utf8');
  const ignore=await readFile(new URL('./.dockerignore',import.meta.url),'utf8');
  assert.match(docker,/COPY --from=build \/app\/content-data\/gddp-2026-2027\.json \.\/content-data\/gddp-2026-2027\.json/);
  assert.match(ignore,/!content-data\/gddp-2026-2027\.json/);
  const data=JSON.parse(await readFile(new URL('./content-data/gddp-2026-2027.json',import.meta.url),'utf8'));
  assert.equal(data.records.length,42);
  assert.deepEqual([1,2,3,4,5].map(g=>data.records.filter(x=>x.grade===g).length),[7,8,10,9,8]);
});
