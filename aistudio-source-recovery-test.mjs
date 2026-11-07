import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {recoverSources} from './scripts/recover-aistudio-source.mjs';
const bytes=Buffer.from('export const restored = true;\n');
const manifest={commit:'02d04447aa496a6b59c8da243084f5b56b358d75',files:[{path:'src/main.tsx',sha256:createHash('sha256').update(bytes).digest('hex')}]};
test('recovers only absent pinned source; existing files never use network or change',async t=>{
 const root=await mkdtemp(join(tmpdir(),'cham-recovery-'));t.after(()=>rm(root,{recursive:true,force:true}));let calls=0;
 const fetchImpl=async url=>{calls++;assert.ok(url.includes('/'+manifest.commit+'/src/main.tsx'));return new Response(bytes);};
 assert.equal(await recoverSources({root,manifest,fetchImpl}),1);
 assert.deepEqual(await readFile(join(root,'src/main.tsx')),bytes);
 await writeFile(join(root,'src/main.tsx'),'local edits');
 assert.equal(await recoverSources({root,manifest,fetchImpl}),0);assert.equal(calls,1);
 assert.equal(await readFile(join(root,'src/main.tsx'),'utf8'),'local edits');
});
test('rejects corrupted downloads and unsafe paths without writing source',async t=>{
 const root=await mkdtemp(join(tmpdir(),'cham-recovery-'));t.after(()=>rm(root,{recursive:true,force:true}));
 await assert.rejects(recoverSources({root,manifest,fetchImpl:async()=>new Response('corrupted')}),/checksum mismatch/);
 await assert.rejects(readFile(join(root,'src/main.tsx')),/ENOENT/);
 await assert.rejects(recoverSources({root,manifest:{...manifest,files:[{...manifest.files[0],path:'../secret.ts'}]}}),/Invalid source recovery entry/);
});

test('recovery snapshot contains the current assistant module contract and isolated learning shell',async()=>{
 const current=JSON.parse(await readFile('scripts/aistudio-source-manifest.json','utf8'));
 assert.notEqual(current.commit,'02d04447aa496a6b59c8da243084f5b56b358d75');
 // Cloudflare's protected production branch intentionally adds Fullscreen and
 // Effectiveness analytics around AppContent; do not overwrite those changes
 // with the older immutable AI Studio snapshot when validating recovery.
 const productionVariantSHA256 = {
   'src/App.tsx': '72e723aa0a675dbac99827bf35555d1e5490da7bc605fa76bf9f6746f4300cbe',
 };
 const mismatches=[];
 for(const path of ['src/App.tsx','src/components/common/DanangAssistantChat.tsx','src/components/common/FeatureLoadBoundary.tsx','src/utils/assistantPosition.ts','src/services/LocalEducationKnowledge.ts','src/services/TeacherLessonSearch.ts','src/features/teacher/GddpTeacherLookup.tsx','src/features/teacher/TeacherAssistantLessonPanel.tsx','src/services/AssistantLearningEngine.ts','src/services/AssistantEffectivenessService.ts','src/components/common/AssistantPracticeCard.tsx','src/components/common/AssistantEffectivenessPanel.tsx','src/data/assistantLearningProfiles.json','src/data/assistantAssessmentBank.json']){
  const entry=current.files.find(e=>e.path===path);assert.ok(entry,path);
  const source=await readFile(path);const actual=createHash('sha256').update(source).digest('hex');const expected=productionVariantSHA256[path] ?? entry.sha256;
  if(actual!==expected)mismatches.push({path,expected,actual});
 }
 assert.deepEqual(mismatches,[], 'Source baseline should match approved immutable or production variants');
});
