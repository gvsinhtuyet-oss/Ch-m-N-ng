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
