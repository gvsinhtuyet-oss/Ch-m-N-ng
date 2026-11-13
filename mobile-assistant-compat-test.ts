import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DanangAssistantChat} from './src/components/common/DanangAssistantChat';
import {splitAssistantSentences} from './src/services/AssistantSentenceSplitter';
test('Safari-safe sentence splitting preserves existing answer boundaries',()=>{
 const cases=['San hô là động vật. Em giữ gìn rạn nhé! Vì sao?','Mưa.\nNước bốc hơi.','Khoảng 3.5 mét; chữ TP. Đà Nẵng.','Một ý chưa có dấu','A! B? C. ','','Ví dụ… chưa kết thúc'];
 const old=new RegExp('(?<=[.!?])\\s+');
 for(const text of cases)assert.deepEqual(splitAssistantSentences(text),text.split(old),text);
});
test('assistant Safari 15 bundle has no unsupported-regexp warnings',async()=>{
 const result=await build({entryPoints:['src/components/common/DanangAssistantChat.tsx'],bundle:true,write:false,platform:'browser',format:'esm',target:'safari15',logLevel:'silent'});
 assert.deepEqual(result.warnings.filter(w=>w.id==='unsupported-regexp'),[]);
 for(const path of ['src/services/AssistantLearningEngine.ts','src/services/DanangAssistantRetrievalService.ts'])assert.doesNotMatch(readFileSync(path,'utf8'),/\(\?<(?=[=!])/);
});
test('mobile entry exists while loading, errors are never silently hidden, and Admin has header access',()=>{
 const app=readFileSync('src/App.tsx','utf8'),header=readFileSync('src/components/common/Header.tsx','utf8');
 assert.match(app,/Mở Trợ lý trong khi tải/);assert.match(app,/const assistantUnavailable = <div role="alert"/);
 assert.doesNotMatch(header,/!adminArea && <button[^>]+className="header-touch-assistant/);
 assert.match(header,/className="header-touch-assistant/);
});

test('mobile chatbot renders on runtimes without Array.prototype.at',()=>{
 const oldWindow=(globalThis as any).window,oldAt=Array.prototype.at;
 (globalThis as any).window={innerWidth:390,innerHeight:844};
 (Array.prototype as any).at=undefined;
 try{const html=renderToStaticMarkup(React.createElement(DanangAssistantChat,{audience:'teacher'}));assert.match(html,/discovery-chat-launcher/);assert.match(html,/Mở Trợ lý khám phá Đà Nẵng/);}
 finally{Array.prototype.at=oldAt;(globalThis as any).window=oldWindow;}
});
