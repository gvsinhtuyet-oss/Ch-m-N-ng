import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';

test('assistant loads with the legacy AI Studio helper that has no compact export',async()=>{
 const result=await build({entryPoints:['src/components/common/DanangAssistantChat.tsx'],bundle:true,write:false,platform:'browser',format:'esm',logLevel:'silent',plugins:[{
  name:'legacy-assistant-helper',setup(builder){
   builder.onResolve({filter:/utils\/assistantPosition$/},()=>({path:'legacy-helper',namespace:'legacy'}));
   builder.onLoad({filter:/.*/,namespace:'legacy'},()=>({contents:'export function constrainAssistantPosition(p,w,h){return {x:Math.max(8,Math.min(p.x,w-164)),y:Math.max(8,Math.min(p.y,h-130))}}',loader:'ts'}));
  }
 }]});
 assert.ok(result.outputFiles[0].contents.length>0);
});

test('assistant starts without RegExp lookbehind and still recognizes Vietnamese word boundaries', async () => {
 const {execFileSync}=await import('node:child_process');
 execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',String.raw`
  import assert from 'node:assert/strict';
  const rejectLookbehind = args => {
   if (typeof args[0] === 'string' && /\(\?<([!=])/.test(args[0])) {
     throw new SyntaxError('RegExp lookbehind unavailable on this Safari version');
   }
  };
  globalThis.RegExp = new Proxy(RegExp, {
   construct(target, args, next) { rejectLookbehind(args); return Reflect.construct(target, args, next); },
   apply(target, receiver, args) { rejectLookbehind(args); return Reflect.apply(target, receiver, args); },
  });
  const {DanangAssistantChat}=await import('./src/components/common/DanangAssistantChat.tsx');
  assert.equal(typeof DanangAssistantChat, 'function');
  const {normalizeDanangDialect}=await import('./src/data/danangAssistantLexicon.ts');
  assert.equal(normalizeDanangDialect('Tại răng cái ni rứa?'), 'tại sao cái này vậy?');
  assert.equal(normalizeDanangDialect('Chi, chi! Chiếu Cẩm Nê.'), 'gì, gì! chiếu cẩm nê.');
  assert.equal(normalizeDanangDialect('🙂Chi, 2chi, chí'), '🙂gì, 2chi, chí');
 `],{cwd:process.cwd(),stdio:'pipe'});
});
