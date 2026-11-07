// End-to-end regression for the NEW shared React Mỹ Khê – Bàn Than engine.
// The approved V12 HTML is not mounted; the same five tasks and images remain.
import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';
import {myKheBanThanConfig as config} from './src/games/stage2/grade3/myKheBanThan.ts';
import {validateConfig} from './src/games/stage2/types.ts';

validateConfig(config);
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>p&&existsSync(p));
assert.ok(chrome,'Chrome unavailable');
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.STAGE2_QA_URL??'http://127.0.0.1:4173';
mkdirSync('stage2-qa-screenshots',{recursive:true});
const root='[data-shared-stage2]';
const click=async (page,sel)=>page.evaluate(([host,selector])=>{
  const node=document.querySelector(host)?.shadowRoot?.querySelector(selector);
  if(!node)return false;
  node.click();return true;
},[root,sel]);
const wait=async (page,sel)=>page.waitForFunction(([host,selector])=>!!document.querySelector(host)?.shadowRoot?.querySelector(selector),{timeout:25000},[root,sel]);

try {
  assert.equal(config.stationId,'g3-station-1');
  assert.equal(config.questions.length,5);
  assert.equal(config.questions[1].options.length,2,'Original true/false must stay two choices');
  for(const [name,width,height] of [
    ['iphone-375',375,667],['iphone-390',390,844],
    ['android-412',412,915],['ipad-768',768,1024],
    ['desktop-1366',1366,768],['desktop-1760',1760,900]
  ]) {
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width,height,isMobile:width<=820,hasTouch:width<=820,deviceScaleFactor:1});
    await page.goto(base+'/?stage2-qa=g3-station-1',{waitUntil:'domcontentloaded',timeout:45000});
    await wait(page,'.intro-start');
    const intro=await page.evaluate(host=>{
      const shadow=document.querySelector(host)?.shadowRoot;
      const shell=shadow?.querySelector('.shell');
      const panel=shadow?.querySelector('.panel');
      const hud=shadow?.querySelector('.hud');
      const art=shell?getComputedStyle(shell,'::before'):null;
      const rect=(el)=>{const r=el?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}:null};
      return {
        iframe:!!document.querySelector('iframe[data-stage2-game-frame]'),
        heading:shadow?.querySelector('.intro-screen h2')?.textContent,
        hud:rect(hud),panel:rect(panel),
        artHeight:parseFloat(art?.height??'0')||0,
        artDisplay:art?.display,
        keys:shadow?.querySelectorAll('.hud-key').length,
        music:!!shadow?.querySelector('.music-toggle'),
        pageWidth:document.documentElement.scrollWidth,
        viewportWidth:window.innerWidth,
      };
    },root);
    console.log('MY KHE SHARED INTRO',name,JSON.stringify(intro));
    assert.equal(intro.iframe,false,'No HTML V12 iframe may be active');
    assert.match(intro.heading??'',/HÀNH TRÌNH TÌM NGỌC BIỂN/);
    assert.equal(intro.keys,5,'five shared gem slots');
    assert.equal(intro.music,true);
    assert.ok(intro.pageWidth<=intro.viewportWidth+4,name+': page overflow');
    assert.ok(intro.panel?.height>0,name+': intro content missing');
    if(width<=650){
      assert.ok(intro.artHeight>80,name+': missing title illustration');
      assert.ok(intro.panel.y>=intro.hud.bottom+70,name+': title covered by HUD or intro');
    }
    const assets=await page.evaluate(async paths=>{
      const entries=await Promise.all(paths.map(async url=>{
        try {const response=await fetch(url,{cache:'no-store'});return {url,status:response.status,type:response.headers.get('content-type')};}
        catch {return {url,status:0,type:null};}
      }));
      return entries;
    },[config.background,config.victoryBackground,...config.questions[0].options.map(o=>o.image)]);
    assert.equal(assets.length,5);
    for(const image of assets)assert.ok(image.status===200&&image.type?.includes('image'),name+': required ORIGINAL image missing '+JSON.stringify(image));
    await page.screenshot({path:'stage2-qa-screenshots/my-khe-shared-intro-'+name+'.png',fullPage:true});
    assert.equal(await click(page,'.intro-start'),true,'start game');
    await wait(page,'.prompt');
    await page.waitForFunction(host=>{
      const shadow=document.querySelector(host)?.shadowRoot;
      const images=[...shadow?.querySelectorAll('.answers .choice-photo')??[]];
      return images.length===3&&images.every(x=>x.complete&&x.naturalWidth>0);
    },{timeout:15000},root);
    const question=await page.evaluate(host=>{
      const shadow=document.querySelector(host)?.shadowRoot;
      const scene=shadow?.querySelector('.scene');
      const panel=shadow?.querySelector('.panel');
      const rect=(el)=>{const r=el?.getBoundingClientRect();return r?{y:r.y,width:r.width,height:r.height}:null};
      return {
        prompt:shadow?.querySelector('.prompt')?.textContent,
        choices:shadow?.querySelectorAll('.answers [data-choice]').length,
        images:shadow?.querySelectorAll('.choice-photo').length,
        panel:rect(panel),
        hud:rect(shadow?.querySelector('.hud')),
        sceneBackground:scene?getComputedStyle(scene).backgroundImage:null,
      };
    },root);
    console.log('MY KHE SHARED QUESTION',name,JSON.stringify(question));
    if(width>=1024){
      const layout=await page.evaluate(host=>{
        const root=document.querySelector(host)?.shadowRoot;
        const scene=root?.querySelector('.scene');
        const panel=root?.querySelector('.panel');
        const shell=root?.querySelector('.shell');
        const css=scene?getComputedStyle(scene):null;
        const r=panel?.getBoundingClientRect();
        return {className:scene?.className,panelTop:r?.top,positionVar:css?.getPropertyValue('--banner-bottom').trim(),shellPadding:shell?getComputedStyle(shell).paddingTop:null};
      },root);
      console.log('MY KHE RAISED QUESTION',name,JSON.stringify(layout));
      assert.match(layout.className??'',/my-khe-game/,'Mỹ Khê scoped layout marker missing');
      assert.ok(layout.panelTop>=180 && layout.panelTop<=315,name+': question should sit close beneath title');
    }

    assert.equal(question.prompt,config.questions[0].prompt);
    assert.equal(question.choices,3);
    assert.equal(question.images,3);
    assert.ok(question.panel?.width<=(width<=650?width+2:900),name+': question card too wide');
    assert.ok(question.panel?.height<=(width<=650?375:560),name+': question card too tall');
    await page.screenshot({path:'stage2-qa-screenshots/my-khe-shared-question-'+name+'.png',fullPage:true});
    if(name==='desktop-1760'){
      // Reproduce the supplied screenshot: matching task (question 4).
      // Answer first 3 questions correctly, then check entire matching block.
      for(let index=0;index<3;index++){
        await page.waitForFunction(([host,n])=>{
          const shadow=document.querySelector(host)?.shadowRoot;
          return shadow?.querySelector('.hud-stage')?.textContent?.includes('CÂU '+(n+1)+'/5');
        },{timeout:15000},[root,index]);
        assert.equal(await click(page,'[data-choice="'+[0,0,1][index]+'"]'),true);
      }
      await page.waitForFunction(host=>{
        const shadow=document.querySelector(host)?.shadowRoot;
        return shadow?.querySelector('.hud-stage')?.textContent?.includes('CÂU 4/5') &&
          !!shadow.querySelector('.match');
      },{timeout:15000},root);
      const matchGeometry=await page.evaluate(host=>{
        const shadow=document.querySelector(host)?.shadowRoot;
        const r=selector=>{
          const el=shadow?.querySelector(selector);
          const b=el?.getBoundingClientRect();
          return b?{top:b.top,bottom:b.bottom,height:b.height}:null;
        };
        return {question:r('.prompt'),panel:r('.panel'),match:r('.match'),controls:r('.match-footer')};
      },root);
      console.log('MY KHE MATCH Q4 POSITION',JSON.stringify(matchGeometry));
      assert.ok(matchGeometry.panel.top>=180 && matchGeometry.panel.top<=315,
        'Question 4 and whole matching panel must move closer to the title');
      assert.ok(matchGeometry.match.top>=matchGeometry.question.bottom &&
        matchGeometry.match.bottom<=matchGeometry.panel.bottom+3,
        'Matching answer cards should remain grouped below the prompt');
      await page.screenshot({path:'stage2-qa-screenshots/my-khe-matching-q4-raised-1760.png',fullPage:true});
    }
    if(name==='iphone-390') {
      // Finish the original five questions through the new shared game:
      // image -> true/false (2 choices) -> 3 choices -> match -> safe-behavior choice.
      const answers=[0,0,1,null,1];
      for(let index=0;index<5;index++){
        await page.waitForFunction(([host,q])=>{
          const shadow=document.querySelector(host)?.shadowRoot;
          return shadow?.querySelector('.hud-stage')?.textContent?.includes('CÂU '+(q+1)+'/5')&&!!shadow.querySelector('.prompt');
        },{timeout:20000},[root,index]);
        if(index===3){
          for(let j=0;j<3;j++){
            assert.equal(await click(page,'[data-left="'+j+'"]'),true);
            assert.equal(await click(page,'[data-right="'+config.questions[3].solution[j]+'"]'),true);
          }
          assert.equal(await click(page,'.controls .btn'),true,'matching confirmation');
        } else {
          const length=await page.evaluate(host=>document.querySelector(host)?.shadowRoot?.querySelectorAll('[data-choice]').length,root);
          assert.equal(length,config.questions[index].options.length,'answer count must match approved task');
          assert.equal(await click(page,'[data-choice="'+answers[index]+'"]'),true,'correct answer '+index);
        }
      }
      await wait(page,'.scene.is-victory');
      const slots=await page.evaluate(host=>({
        total:document.querySelector(host)?.shadowRoot?.querySelectorAll('.hud-key').length,
        earned:document.querySelector(host)?.shadowRoot?.querySelectorAll('.hud-key.earned').length
      }),root);
      assert.deepEqual(slots,{total:5,earned:5},'all five original gems must be earned');
      await page.screenshot({path:'stage2-qa-screenshots/my-khe-shared-victory-iphone.png',fullPage:true});
      assert.equal(await click(page,'.continue-btn'),true,'continue to stage 3');
      await page.waitForFunction(()=>document.body.textContent?.includes('Bản chơi thử · Chặng 3'),{timeout:15000});
      console.log('MY KHE SHARED COMPLETION: five original tasks, five gems, Stage 3 OK');
    }
    assert.deepEqual(errors,[],name+': page errors');
    await page.close();
  }
  console.log('MY KHE SHARED ENGINE QA PASSED: exact original images + 5 tasks + rewards + responsive screens.');
} finally {await browser.close()}
