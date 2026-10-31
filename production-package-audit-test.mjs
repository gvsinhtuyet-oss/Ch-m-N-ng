import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,mkdtemp,cp,rm,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawn} from 'node:child_process';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function inventory(root,prefix=''){
 const result=new Map();
 for(const e of await readdir(join(root,prefix),{withFileTypes:true})){
  const path=prefix?prefix+'/'+e.name:e.name;
  if(e.isDirectory())for(const [k,v] of await inventory(root,path))result.set(k,v);
  else {assert.ok(e.isFile(),'No symbolic links in runtime: '+path);result.set(path,hash(await readFile(join(root,path))));}
 }
 return result;
}
test('all static files and backend modules survive packaging unchanged',async()=>{
 const staged=resolve('.production-build');
 const before=await inventory(resolve('dist')),after=await inventory(join(staged,'dist'));
 assert.deepEqual(after,before,'Every static path and SHA256 must match');
 const assets=await inventory(resolve('public'));
 for(const [path,digest] of assets)assert.equal(after.get(path),digest,'Public asset: '+path);
 const manifest=JSON.parse(await readFile(join(staged,'runtime-manifest.json'),'utf8'));
 for(const file of manifest.backendModules)assert.equal(hash(await readFile(join(staged,file))),hash(await readFile(file)),file);
 const lock=JSON.parse(await readFile('package-lock.json','utf8'));
 for(const path of manifest.dependencies){
  assert.ok(!lock.packages[path].dev&&!lock.packages[path].devOptional,path);
  assert.equal(JSON.parse(await readFile(join(staged,path,'package.json'),'utf8')).version,lock.packages[path].version,path);
 }
 console.log('Verified all '+before.size+' static files, '+manifest.backendModules.length+' backend modules and '+manifest.dependencies.length+' installed production packages.');
});
test('complete HTTP integration suite passes outside repository dependency resolution', {timeout:60000},async()=>{
 const temp=await mkdtemp(join(tmpdir(),'cham-isolated-runtime-'));
 try {
  await cp(resolve('.production-build'),temp,{recursive:true});
  // This temp directory is outside the checkout: missing runtime dependencies cannot
  // silently resolve against the checkout's development node_modules.
  const childEnv={...process.env,CHAM_TEST_PRODUCTION_DIR:temp};delete childEnv.NODE_TEST_CONTEXT;
  const sdkCode=`import assert from 'node:assert/strict';
  globalThis.fetch=async(input)=>{assert.equal(new URL(String(input)).hostname,'generativelanguage.googleapis.com');return new Response(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:'SYNTHETIC_RESPONSE'}]}}]}),{status:200,headers:{'Content-Type':'application/json'}});};
  const {GoogleGenAI}=await import('@google/genai');
  const answer=await new GoogleGenAI({apiKey:'synthetic-not-sent'}).models.generateContent({model:'gemini-2.5-flash-lite',contents:'Synthetic package test'});
  assert.equal(answer.text,'SYNTHETIC_RESPONSE');console.log('SDK_STUB_OK');`;
  const sdk=await new Promise((done,fail)=>{const child=spawn(process.execPath,['--input-type=module','-e',sdkCode],{cwd:temp,env:childEnv,stdio:['ignore','pipe','pipe']});let text='';child.stdout.on('data',b=>text+=b);child.stderr.on('data',b=>text+=b);child.once('error',fail);child.once('exit',code=>done({code,text}));});
  assert.equal(sdk.code,0,sdk.text);assert.match(sdk.text,/SDK_STUB_OK/);

  const result=await new Promise((done,fail)=>{
   const child=spawn(process.execPath,['--test',resolve('production-api-test.mjs')],{env:childEnv,stdio:['ignore','pipe','pipe']});
   let text=''; child.stdout.on('data',b=>text+=b);child.stderr.on('data',b=>text+=b);child.once('error',fail);child.once('exit',code=>done({code,text}));
  });
  assert.equal(result.code,0,result.text);assert.match(result.text,/tests 1/);assert.doesNotMatch(result.text,/skipping running files/);console.log(result.text);
 }finally {await rm(temp,{recursive:true,force:true});}
});
