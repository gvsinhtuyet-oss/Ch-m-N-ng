import assert from 'node:assert/strict';
import { mkdirSync, existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { ALL_25_STATIONS } from './src/data/allStations.ts';
import { grade2SharedConfigs } from './src/games/stage2/grade2/index.ts';

const url = process.env.STAGE2_QA_URL ?? 'http://127.0.0.1:4173';
const executablePath = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
].find(path => path && existsSync(path));
assert.ok(executablePath, 'Chromium/Chrome is needed for visual QA');
const browser = await puppeteer.launch({
  executablePath, headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
});
mkdirSync('stage2-qa-screenshots',{recursive:true});

const rootProbe = () => {
  const iframe = document.querySelector('iframe[data-stage2-game-frame]');
  if (iframe) {
    const doc = iframe.contentDocument;
    return doc?.querySelector('.scene') ? {root:doc,iframe:true} : null;
  }
  const root = document.querySelector('[data-shared-stage2]')?.shadowRoot;
  return root?.querySelector('.scene') ? {root,iframe:false} : null;
};

async function openGame(stationId, viewport) {
  const page = await browser.newPage();
  const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({...viewport,isMobile:viewport.width<=820,hasTouch:true,deviceScaleFactor:1});
  await page.goto(url+'/?stage2-qa='+encodeURIComponent(stationId),{waitUntil:'domcontentloaded',timeout:40000});
  await page.waitForFunction(() => {
    const frame=document.querySelector('iframe[data-stage2-game-frame]');
    if(frame)return Boolean(frame.contentDocument?.querySelector('.scene'));
    return Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.scene'));
  },{timeout:30000});
  // Legacy iframe's content appears before the iframe load event fires.
  // Wait for React's onLoad layout injection before measuring geometry.
  if(viewport.width<=650 && await page.$('iframe[data-stage2-game-frame]')) {
    try {
      await page.waitForFunction(() => {
        const frame=document.querySelector('iframe[data-stage2-game-frame]');
        const doc=frame?.contentDocument;
        const shell=doc?.querySelector('.scene .shell');
        const hud=doc?.querySelector('.scene .hud');
        return Boolean(doc?.documentElement.hasAttribute('data-stage2-portrait') &&
          shell && hud?.parentElement===shell && doc.querySelector('.music-toggle'));
      },{timeout:40000});
    } catch(error) {
      const debug=await page.evaluate(()=>{
        const frame=document.querySelector('iframe[data-stage2-game-frame]');
        const doc=frame?.contentDocument;
        const scene=doc?.querySelector('.scene');
        const hud=doc?.querySelector('.hud');
        return {
          readyState:doc?.readyState,portrait:doc?.documentElement.hasAttribute('data-stage2-portrait'),
          parentMatches:window.matchMedia('(max-width: 650px) and (orientation: portrait)').matches,
          sceneCount:doc?.querySelectorAll('.scene').length,
          hudCount:doc?.querySelectorAll('.hud').length,
          hudParent:hud?.parentElement?.className,
          rootChildren:Array.from(scene?.querySelector('.shell')?.children??[]).map(x=>x.className),
          buttonClasses:Array.from(doc?.querySelectorAll('button')??[]).slice(0,25).map(x=>({cls:x.className,id:x.id,text:x.textContent?.slice(0,25)})),
          script:!!doc?.getElementById('cham-danang-shared-audio'),
          gameAudio:!!frame?.contentWindow?.ChamDaNangGameAudio,
          sourceHref:frame?.contentWindow?.location.href,
        };
      });
      console.error('LEGACY TIMEOUT DEBUG',stationId,JSON.stringify(debug));
      await page.screenshot({path:'stage2-qa-screenshots/'+stationId+'-timeout.png',fullPage:true});
      throw error;
    }
  }
  const metrics=await page.evaluate(() => {
    const frame=document.querySelector('iframe[data-stage2-game-frame]');
    const root=frame?.contentDocument ?? document.querySelector('[data-shared-stage2]')?.shadowRoot;
    const shell=root?.querySelector('.scene:not(.is-victory) .shell');
    const hud=shell?.querySelector('.hud') ?? shell?.querySelector('.top');
    const panel=shell?.querySelector('.panel');
    const hero=shell?getComputedStyle(shell,'::before'):null;
    const hudRect=hud?.getBoundingClientRect();
    const panelRect=panel?.getBoundingClientRect();
    return {
      iframe:!!frame,
      width:window.innerWidth,
      documentWidth:document.documentElement.scrollWidth,
      innerWidth:frame?.contentDocument?.documentElement.scrollWidth,
      shell:!!shell,hud:!!hud,panel:!!panel,
      hudOrder:hud?getComputedStyle(hud).order:'',
      panelOrder:panel?getComputedStyle(panel).order:'',
      heroDisplay:hero?.display,heroHeight:parseFloat(hero?.height??'0')||0,
      gap:panelRect&&hudRect?panelRect.top-hudRect.bottom:null,
      musicButton:!!root?.querySelector('.music-toggle'),
      prompt:!!root?.querySelector('.intro-start, .intro-screen'),
      htmlPortrait:frame?.contentDocument?.documentElement.hasAttribute('data-stage2-portrait'),
      hudParent:hud?.parentElement?.className,
      shellChildren:shell?Array.from(shell.children).map(x=>({tag:x.tagName,cls:x.className})):[],
      hudPosition:hud?getComputedStyle(hud).position:'',
      hudText:hud?.textContent?.slice(0,160),
      hudButtons:hud?Array.from(hud.querySelectorAll('button')).map(b=>({cls:b.className,aria:b.getAttribute('aria-label'),text:b.textContent?.slice(0,30)})):[],
      shellDisplay:shell?getComputedStyle(shell).display:'',
    };
  });
  return {page,metrics,errors};
}

function assertLayout(id,metrics,isPhone) {
  assert.ok(metrics.shell&&metrics.panel, id+': missing game panel');
  assert.ok(metrics.documentWidth<=metrics.width+3,
    id+': horizontal page overflow '+metrics.documentWidth+' > '+metrics.width);
  if(isPhone){
    assert.ok(metrics.hud,id+': missing live HUD controls');
    assert.ok(metrics.musicButton,id+': missing working sound control');
    assert.equal(metrics.hudOrder,'1',id+': HUD must precede artwork');
    assert.equal(metrics.panelOrder,'3',id+': question panel must follow artwork');
    assert.ok(metrics.heroHeight>=80,id+': 16:9 artwork not visible ('+metrics.heroHeight+')');
    assert.ok(metrics.gap>=50,id+': HUD or panel overlaps title artwork ('+metrics.gap+')');
  }
}

async function shadowClick(page,selector){
  return page.evaluate(selector=>{
    const el=document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector(selector);
    if(!el)return false;
    el.click();return true;
  },selector);
}
async function shadowWait(page,predicate,timeout=9000){
  await page.waitForFunction(predicate,{timeout});
}

try{
  const phone={width:390,height:844};
  for(const station of ALL_25_STATIONS){
    const {page,metrics,errors}=await openGame(station.id,phone);
    if(station.id==='g3-station-1'||station.id==='g3-station-2') {
      console.log('LEGACY DEBUG',station.id,JSON.stringify(metrics));
      await page.screenshot({path:'stage2-qa-screenshots/'+station.id+'-before-assert.png',fullPage:true});
    }
    assertLayout(station.id,metrics,true);
    if(station.id==='g3-station-1'){
      const toggle=await page.evaluate(()=>{
        const btn=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument?.querySelector('.music-toggle');
        const before=btn?.getAttribute('aria-pressed');btn?.click();
        return {before,after:btn?.getAttribute('aria-pressed')};
      });
      assert.ok(toggle.before!==null&&toggle.after!==toggle.before,'My Khe sound button should toggle');
    }
    assert.deepEqual(errors,[],station.id+': JavaScript errors');
    console.log('PHONE OK',station.id,metrics.iframe?'HTML':'React',
      'hero',metrics.heroHeight,'gap',metrics.gap);
    if(['g3-station-1','g3-station-2','g1-station-1','g2-station-1','g4-station-1','g5-station-1'].includes(station.id)){
      await page.screenshot({path:'stage2-qa-screenshots/'+station.id+'-390x844.png',fullPage:true});
    }
    await page.close();
  }
  for(const [width,height,label] of [
    [320,640,'small-iphone'],[375,667,'iphone'],[412,915,'android'],
    [768,1024,'ipad'],[820,1180,'ipad-air']
  ]) {
    for(const id of ['g3-station-1','g3-station-2','g2-station-1']){
      const {page,metrics,errors}=await openGame(id,{width,height});
      assertLayout(id+' '+label,metrics,width<=650);
      assert.deepEqual(errors,[],id+' '+label+': JavaScript errors');
      await page.screenshot({path:'stage2-qa-screenshots/'+id+'-'+label+'.png',fullPage:true});
      await page.close();
      console.log('DEVICE OK',label,id);
    }
  }

  // One real in-app React interaction path: wrong feedback, mute, keys, replay, Stage 3.
  const id='g2-station-1';
  const config=grade2SharedConfigs[id];
  const {page,errors}=await openGame(id,phone);
  const mutedBefore=await page.evaluate(()=>
    document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.music-toggle')?.getAttribute('aria-pressed'));
  assert.equal(await shadowClick(page,'.music-toggle'),true,'sound control is clickable');
  const mutedAfter=await page.evaluate(()=>
    document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.music-toggle')?.getAttribute('aria-pressed'));
  assert.notEqual(mutedAfter,mutedBefore,'sound toggle must change state');
  assert.equal(await shadowClick(page,'.intro-start'),true,'start button must respond');
  await shadowWait(page,()=>Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.prompt')));
  const incorrectIndex=(config.questions[0].answer+1)%3;
  assert.equal(await shadowClick(page,'button[data-choice="'+incorrectIndex+'"]'),true,'wrong answer must be clickable');
  await shadowWait(page,()=>Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.feedback')?.textContent?.includes('Chưa đúng')));
  console.log('INTERACTION OK wrong-answer feedback, sound toggle');

  // Restart from a clean read-only session; all correct answers should award all keys.
  await page.goto(url+'/?stage2-qa='+id,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.intro-start')),{timeout:30000});
  await shadowClick(page,'.intro-start');
  for(let i=0;i<config.questions.length;i++){
    await page.waitForFunction(index=>{
      const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
      return root?.querySelector('.prompt')&&root.querySelector('.hud-stage')?.textContent?.includes('CÂU '+(index+1)+'/');
    },{timeout:15000},i);
    const question=config.questions[i];
    if(question.kind==='match'){
      for(let left=0;left<question.solution.length;left++){
        assert.equal(await shadowClick(page,'[data-left="'+left+'"]'),true);
        assert.equal(await shadowClick(page,'[data-right="'+question.solution[left]+'"]'),true);
      }
      assert.equal(await shadowClick(page,'.controls .btn'),true,'matching confirmation');
    }else{
      assert.equal(await shadowClick(page,'button[data-choice="'+question.answer+'"]'),true,'correct option');
    }
  }
  await page.waitForFunction(()=>
    Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.scene.is-victory')),{timeout:20000});
  const earned=await page.evaluate(()=>
    document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelectorAll('.hud-key.earned').length);
  assert.equal(earned,5,'Five earned keys on victory');
  await page.screenshot({path:'stage2-qa-screenshots/grade2-victory.png',fullPage:true});
  assert.equal(await shadowClick(page,'.continue-btn'),true,'continue to Stage 3');
  await page.waitForFunction(()=>document.body.textContent?.includes('Bản chơi thử · Chặng 3'),{timeout:20000});
  console.log('INTERACTION OK five keys and Stage 3 transition');
  assert.deepEqual(errors,[],'grade2 game JavaScript errors');
  await page.close();
  console.log('STAGE 2 BROWSER QA PASSED: 25 phone renderers + device sizes + interactive progression');
}finally{
  await browser.close();
}
