import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('public/games/hoi-vui-que-em/index.html','utf8');
const script=html.split('<script>')[1].split('</script>')[0];
function game(){
 const elements=new Map(),messages=[];
 const element=(id)=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',disabled:false,dataset:{choice:id},className:'',classList:{add(){},remove(){}},setAttribute(){},getContext(){return {clearRect(){},beginPath(){},arc(){},fill(){}}}});return elements.get(id);};
 const document={hidden:false,getElementById:element,querySelectorAll(){return [];},querySelector:element,addEventListener(){}};
 const window={parent:{postMessage(value,origin){messages.push({value,origin});}},location:{origin:'https://school.example'},innerWidth:390,innerHeight:800,matchMedia(){return {matches:false};},addEventListener(){},setInterval(){return 1;}};
 const context=vm.createContext({window,document,Math,requestAnimationFrame(){return 1;},cancelAnimationFrame(){},clearInterval(){}});
 vm.runInContext(script,context);
 return {run:code=>vm.runInContext(code,context),messages,elements};
}
test('four tasks require correct answers; wrong and unknown choices cannot unlock completion',()=>{
 const g=game();g.run('start()');g.run('next()');assert.equal(g.run('taskIndex'),0);
 g.run("choose('tug');next()");assert.equal(g.run('taskIndex'),0);assert.equal(g.run('solved'),false);assert.equal(g.messages.length,0);
 g.run("choose('unknown')");assert.equal(g.run('solved'),false);
 g.run("choose('blindfold');next();choose('find');next();choose('mai');next();choose('inside');next()");
 assert.equal(g.run('screen'),'victory');assert.equal(g.run('firstTry'),3);
 assert.equal(g.messages.length,1);assert.equal(g.messages[0].value.stationId,'g1-station-2');assert.equal(g.messages[0].value.type,'cham-danang-game-complete');assert.equal(g.messages[0].origin,'https://school.example');
 g.run('notifyComplete()');assert.equal(g.messages.length,1);
});
test('replay resets the round and stops fireworks; continue is exposed only on victory',()=>{
 const g=game();g.run('start()');assert.equal(g.elements.has('continue'),false);
 g.run("choose('blindfold');next();choose('find');next();choose('mai');next();choose('inside');next()");assert.equal(g.run('celebrating'),true);
 g.elements.get('continue').onclick();assert.equal(g.messages[1].value.type,'cham-danang-game-continue');
 g.elements.get('replay').onclick();assert.equal(g.run('screen'),'task');assert.equal(g.run('taskIndex'),0);assert.equal(g.run('firstTry'),0);assert.equal(g.run('solved'),false);assert.equal(g.run('celebrating'),false);assert.equal(g.run('completionSent'),false);
});
test('game routing and wrapper validate iframe source and correct station before accepting completion',()=>{
 const wrapper=readFileSync('src/components/station/ApprovedStationGame.tsx','utf8'),stage=readFileSync('src/components/station/Stage2Challenge.tsx','utf8');
 assert.match(wrapper,/'g1-station-2': \{ path: '\/games\/khoi-1-kham-pha\/index.html\?station=g1-station-2'/);assert.match(stage,/station.id === 'g1-station-2'/);
 assert.match(wrapper,/event.origin !== window.location.origin/);assert.match(wrapper,/event.source !== frameRef.current\?\.contentWindow/);assert.match(wrapper,/event.data\?\.stationId === station.id && completionHandled.current/);
});
