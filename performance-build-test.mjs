import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
let precache=[],routes=[];
const strategy=class {constructor(options){this.options=options;}};
const workbox={clientsClaim(){},precacheAndRoute(entries){precache=entries;},cleanupOutdatedCaches(){},registerRoute(...route){routes.push(route);},NavigationRoute:strategy,createHandlerBoundToURL(){},CacheFirst:strategy,NetworkFirst:strategy,StaleWhileRevalidate:strategy,ExpirationPlugin:strategy,CacheableResponsePlugin:strategy};
const self={define(){},skipWaiting(){},location:{origin:'https://example.test'}};
vm.runInNewContext(readFileSync('dist/sw.js','utf8'),{self,define:(deps,callback)=>callback(workbox)});
test('install caches shell, never eagerly downloads lesson media or lazy feature scripts',()=>{
 assert.ok(precache.some(entry=>entry.url==='index.html'));
 const html=readFileSync('dist/index.html','utf8');
 const startup=new Set(Array.from(html.matchAll(/(?:src|href)=["']\/([^"']+\.(?:js|css))["']/g),match=>match[1]));
 assert.ok(precache.every(entry=>!entry.url.startsWith('learning/')&&!entry.url.startsWith('images/')&&(!/\.(?:js|css)$/.test(entry.url)||startup.has(entry.url))));
 for(const script of startup)assert.ok(precache.some(entry=>entry.url===script),script);
 const bytes=new Map(precache.map(entry=>[entry.url,statSync('dist/'+entry.url).size]));
 assert.ok([...bytes.values()].reduce((a,b)=>a+b,0)<1500000);
});
test('on-demand caches match same-origin images and scripts while excluding API calls',()=>{
 for(const destination of ['script','image']){
  const route=routes.find(([match])=>typeof match==='function'&&match({url:new URL('https://example.test/assets/file'),request:{destination}}));
  assert.ok(route,destination);
  assert.equal(route[0]({url:new URL('https://other.test/file'),request:{destination}}),false);
  assert.equal(route[0]({url:new URL('https://example.test/api/content'),request:{destination:''}}),false);
  assert.deepEqual(Array.from(route[1].options.plugins[1].options.statuses),[200]);
 }
});
test('all generated thumbnails exist in production and are smaller than their originals',()=>{
 const mapping=JSON.parse(readFileSync('src/data/learningThumbnails.json','utf8'));
 assert.ok(Object.keys(mapping).length>0);
 for(const [original,thumbnail] of Object.entries(mapping)){
  assert.ok(statSync('dist'+thumbnail).size<statSync('public'+original).size,original);
 }
});
test('feature screens are emitted separately from the entry',()=>{
 const assets=readdirSync('dist/assets');
 for(const feature of ['TeacherDashboard','AdminDashboard','StationView'])assert.ok(assets.some(name=>name.startsWith(feature+'-')&&name.endsWith('.js')),feature);
 const html=readFileSync('dist/index.html','utf8');
 assert.ok(!/modulepreload[^>]+(?:TeacherDashboard|AdminDashboard|exceljs)/.test(html));
});
