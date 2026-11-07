import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createLearningFeedback} from './learning-feedback.mjs';

const read = path => readFileSync(path,'utf8');

test('admin design keeps a single real station editor, accessible navigation and explicit save confirmation',()=>{
  const dashboard=read('src/features/admin/AdminDashboard.tsx');
  const editor=read('src/features/admin/ContentEditor.tsx');
  const css=read('src/index.css');
  const header=read('src/components/common/Header.tsx');
  assert.equal((dashboard.match(/<ContentEditor\s*\/>/g)||[]).length,1,'Station editor must not render twice');
  assert.match(dashboard,/aria-label="Điều hướng quản trị"/);
  assert.match(dashboard,/admin-sidebar/);
  assert.match(dashboard,/admin-page-hero/);
  assert.match(editor,/hasUnsavedChanges/);
  assert.match(editor,/window\.confirm/);
  assert.match(editor,/admin-image-preview/);
  assert.match(css,/\.admin-sidebar .*\[aria-current\]/);
  assert.match(css,/\.cham-admin-topbar/);
  assert.match(header,/adminArea/);
});

test('rating summary is admin-only and aggregate is cached between reads',async()=>{
  const rating={stationId:'g1-station-1',stars:5};
  let reads=0,verified=0;
  const store={list:async collection=>{assert.equal(collection,'cham_journey_ratings');reads++;return [rating];}};
  const auth={requireAdmin:async()=>{verified++;}};
  const handle=createLearningFeedback({store,auth});
  const results=[];
  const json=(res,status,payload)=>{results.push({status,payload});};
  const req={method:'GET'};
  assert.equal(await handle(req,{},'/api/admin/station-ratings',null,json),true);
  assert.equal(await handle(req,{},'/api/admin/station-ratings',null,json),true);
  assert.equal(verified,2,'Every read must check admin rights');
  assert.equal(reads,1,'Repeated admin views should not scan Firestore again within TTL');
  assert.equal(results[0].payload.ratings['g1-station-1'][4],1);
});
