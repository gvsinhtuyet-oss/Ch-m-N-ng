import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {constrainAssistantPosition} from './src/utils/assistantPosition';
import {DanangAssistantChat} from './src/components/common/DanangAssistantChat';

test('dragged assistant stays fully visible on phone and desktop, including after rotation',()=>{
 for(const [width,height] of [[390,844],[844,390],[1920,1080]]){
  for(const point of [{x:-100,y:-100},{x:9999,y:9999},{x:24,y:500}]){
   const p=constrainAssistantPosition(point,width,height);
   assert.ok(p.x>=8&&p.y>=8);
   assert.ok(p.x+156<=width-8&&p.y+122<=height-8);
  }
 }
});
test('launcher label is always rendered; enlarged control exposes open state and touch drag',()=>{
 const previous=(globalThis as any).window;
 (globalThis as any).window={innerWidth:390,innerHeight:844};
 try{
  const html=renderToStaticMarkup(<DanangAssistantChat/>);
  assert.match(html,/Trợ lý khám phá<\/span>/);
  assert.match(html,/h-\[72px\]/);
  assert.match(html,/aria-expanded="false"/);
  assert.match(html,/touch-action:none/);
  assert.doesNotMatch(html,/group-hover:flex/);
 }finally{(globalThis as any).window=previous;}
});
