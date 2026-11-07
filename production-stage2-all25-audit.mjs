/* Read-only live Production verification for ALL 25 Stage 2 games.
 * Screens: iPhone 390x844 and desktop 1366x768, all questions and rewards.
 * Also checks representative iPhone SE/Android/iPad screens.
 * Does not send or modify student data. Run with: node --import tsx production-stage2-all25-audit.mjs */
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import puppeteer from 'puppeteer-core';
import {ALL_25_STATIONS} from './src/data/allStations.ts';
import {grade1SharedConfigs} from './src/games/stage2/grade1/index.ts';
import {grade2SharedConfigs} from './src/games/stage2/grade2/index.ts';
import {grade3SharedConfigs} from './src/games/stage2/grade3/index.ts';
import {grade45SharedConfigs} from './src/games/stage2/grade45/index.ts';
import {validateConfig} from './src/games/stage2/types.ts';

const site=process.env.STAGE2_QA_URL||'https://chamdanang-gddp.pages.dev';
const exe=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>p&&existsSync(p));
assert.ok(exe,'Chromium is unavailable');
const browser=await puppeteer.launch({executablePath:exe,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
mkdirSync('production-stage2-audit',{recursive:true});
const configs={...grade1SharedConfigs,...grade2SharedConfigs,...grade3SharedConfigs,...grade45SharedConfigs};
const results=[];
const HIDDEN_TEXT_OVERFLOWS=new Set(['hidden','clip']);

assert.equal(ALL_25_STATIONS.length,25,'App must contain precisely 25 Stage 2 stations');
assert.equal(new Set(ALL_25_STATIONS.map(s=>s.id)).size,25,'Station IDs unique');
for(const station of ALL_25_STATIONS){
  assert.equal(station.challenge.platform,'internal_interactive',station.id+' should not depend on Wordwall');
  if(station.id!=='g3-station-2'){
    const config=configs[station.id];
    assert.ok(config,station.id+': missing active shared game');
    validateConfig(config);
    assert.equal(config.questions.length,station.grade===1?4:5,station.id+': question count');
  }
}
console.log('CATALOG CHECK: 25/25 routes, all internal games, grade 1 has four questions, grades 2–5 have five');

const getGame=()=> {
  const frame=document.querySelector('iframe[data-stage2-game-frame]');
  if(frame) return {root:frame.contentDocument,frame};
  return {root:document.querySelector('[data-shared-stage2]')?.shadowRoot,frame:null};
};
async function open(id,width,height){
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height,isMobile:width<=820,hasTouch:width<=820,deviceScaleFactor:1});
  const started=Date.now();
  const response=await page.goto(site+'/?stage2-qa='+id+'&qa-full=20261107',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response?.status(),200,id+' page HTTP');
  await page.waitForFunction(()=>{
    const frame=document.querySelector('iframe[data-stage2-game-frame]');
    if(frame)return Boolean(frame.contentDocument?.querySelector('.scene .intro-start'));
    return Boolean(document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.intro-start'));
  },{timeout:45000});
  if(id==='g3-station-2'){
    await page.waitForFunction(()=>{
      const d=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      return Boolean(d?.getElementById('cham-danang-v18-hud-corners'));
    },{timeout:30000});
  }
  return {page,errors,readyMs:Date.now()-started};
}
const rectInPage=async page=>page.evaluate(()=>{
  const frame=document.querySelector('iframe[data-stage2-game-frame]');
  const root=frame?.contentDocument??document.querySelector('[data-shared-stage2]')?.shadowRoot;
  const elements=[...root?.querySelectorAll('.prompt, .answers button, .matchcol button, .hud-stage, .intro-screen h2, .intro-start, .continue-btn, .choice-letter')??[]];
  const clipped=[];
  const r=el=>{const x=el?.getBoundingClientRect();return x?{x:Math.round(x.x),y:Math.round(x.y),w:Math.round(x.width),h:Math.round(x.height),right:Math.round(x.right),bottom:Math.round(x.bottom)}:null};
  for(const el of elements){
    const css=getComputedStyle(el);
    if(css.display==='none'||css.visibility==='hidden')continue;
    const txt=el.textContent?.trim().slice(0,95)||'';
    if(!txt)continue;
    const overflowX=el.scrollWidth-el.clientWidth;
    const overflowY=el.scrollHeight-el.clientHeight;
    if((overflowX>8&&['hidden','clip'].includes(css.overflowX)) ||
       (overflowY>8&&['hidden','clip'].includes(css.overflowY)) ||
       ((css.textOverflow==='ellipsis')&&overflowX>5)){
      clipped.push({tag:el.tagName,cls:el.className,text:txt,x:overflowX,y:overflowY});
    }
  }
  const scene=root?.querySelector('.scene'),panel=root?.querySelector('.panel');
  const hud=root?.querySelector('.hud'),prompt=root?.querySelector('.prompt');
  const iframeWidth=frame?.contentWindow?.innerWidth||null;
  return {
    innerWidth:window.innerWidth,docWidth:document.documentElement.scrollWidth,
    gameDocWidth:frame?.contentDocument?.documentElement.scrollWidth||null,
    gameWidth:iframeWidth,scene:r(scene),panel:r(panel),hud:r(hud),prompt:r(prompt),
    clipped,buttons:[...root?.querySelectorAll('button')??[]].filter(b=>!b.disabled).length,
    hasHorizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+4,
    imageElements:[...root?.querySelectorAll('.choice-photo')??[]].map(x=>({complete:x.complete,w:x.naturalWidth,src:x.getAttribute('src')?.slice(0,110)})),
  };
});
const validateGeometry=(g,id,label,step)=>{
  assert.ok(g.scene&&g.panel,id+' '+label+' '+step+': missing game scene or panel');
  assert.equal(g.hasHorizontalOverflow,false,id+' '+label+' '+step+': page horizontally overflows');
  if(g.gameDocWidth&&g.gameWidth)
    assert.ok(g.gameDocWidth<=g.gameWidth+8,id+' '+label+' '+step+': HTML game viewport overflows horizontally');
  assert.ok(g.panel.w>=100&&g.panel.h>=20,id+' '+label+' '+step+': empty panel');
  assert.ok(g.panel.x>=-8,id+' '+label+' '+step+': panel clipped on left');
  const frameAllowance=g.gameWidth??g.innerWidth;
  assert.ok(g.panel.right<=frameAllowance+9,id+' '+label+' '+step+': panel clipped on right');
  assert.deepEqual(g.clipped,[],id+' '+label+' '+step+': clipped question/button text');
  assert.ok(g.buttons>0,id+' '+label+' '+step+': no active controls');
  for(const image of g.imageElements)assert.ok(image.complete&&image.w>0,id+' '+label+' '+step+': broken image '+image.src);
};
async function clickShared(page,selector){
  const done=await page.evaluate(sel=>{
    const node=document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector(sel);
    if(!node||node.disabled)return false;node.click();return true;
  },selector);
  assert.ok(done,'Cannot interact with shared-game control: '+selector);
}
async function clickFrame(page,selector){
  const done=await page.evaluate(sel=>{
    const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
    const node=doc?.querySelector(sel);
    if(!node||node.disabled)return false;node.click();return true;
  },selector);
  assert.ok(done,'Cannot interact with HTML game control: '+selector);
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function answerShared(page,q,id,grade,index){
  if(q.kind==='match'){
    for(let left=0;left<q.left.length;left++){
      await clickShared(page,'[data-left="'+left+'"]');
      await page.waitForFunction(j=>{
        const node=document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('[data-left="'+j+'"]');
        return node?.getAttribute('aria-pressed')==='true';
      },{timeout:4000},left);
      const right=q.right[q.solution[left]].trim();
      const r=await page.evaluate(str=>{
        const buttons=[...document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelectorAll('[data-right]')??[]];
        return buttons.find(b=>b.textContent?.trim()===str)?.getAttribute('data-right')??null;
      },right);
      assert.notEqual(r,null,id+': matching right card missing '+right);
      await clickShared(page,'[data-right="'+r+'"]');
    }
    await page.waitForFunction(()=>{
      const btn=document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelector('.controls .btn');
      return !!btn&&!btn.disabled;
    },{timeout:4000});
    await clickShared(page,'.controls .btn');
    return;
  }
  const answers=q.answers?.length?q.answers:[q.answer];
  for(const correct of answers){
    const indexInRendered=await page.evaluate(({grade,kind,text,image,idx,questionIndex})=>{
      const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
      const buttons=[...root?.querySelectorAll('.answers button[data-choice]')??[]];
      if(grade!==1||(questionIndex===1&&kind==='choice'))return idx;
      const found=buttons.find(b=>{
        if(kind==='image'){
          const src=b.querySelector('img')?.getAttribute('src');
          return !!src&&new URL(src,location.href).pathname===image;
        }
        return b.textContent?.includes(text);
      });
      return found?Number(found.getAttribute('data-choice')):-1;
    },{grade,kind:q.kind,text:q.options[correct].text,image:q.options[correct].image,idx:correct,questionIndex:index});
    assert.ok(indexInRendered>=0,id+': correct choice not available for question '+(index+1));
    await clickShared(page,'[data-choice="'+indexInRendered+'"]');
    if(answers.length>1)await pause(90);
  }
}
async function runShared(page,id,grade,config,label){
  await clickShared(page,'.intro-start');
  const tops=[];
  for(let i=0;i<config.questions.length;i++){
    await page.waitForFunction(n=>{
      const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
      return !!root?.querySelector('.prompt')&&root.querySelector('.hud-stage')?.textContent?.includes('CÂU '+(n+1)+'/');
    },{timeout:18000},i);
    await page.waitForFunction(()=>{
      const images=[...document.querySelector('[data-shared-stage2]')?.shadowRoot?.querySelectorAll('.choice-photo')??[]];
      return images.every(x=>x.complete&&x.naturalWidth>0);
    },{timeout:13000});
    const g=await rectInPage(page);
    validateGeometry(g,id,label,'q'+(i+1));
    tops.push(g.panel.y);
    if(i===0||i===3){
      await page.screenshot({path:'production-stage2-audit/'+id+'-'+label+'-q'+(i+1)+'.png',fullPage:true});
    }
    await answerShared(page,config.questions[i],id,grade,i);
  }
  await page.waitForFunction(()=>{
    const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
    return Boolean(root?.querySelector('.scene.is-victory'));
  },{timeout:20000});
  const earned=await page.evaluate(()=>{
    const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
    return {all:root?.querySelectorAll('.hud-key').length,earned:root?.querySelectorAll('.hud-key.earned').length};
  });
  assert.equal(earned.all,config.questions.length,id+' game reward total');
  assert.equal(earned.earned,earned.all,id+' earned all rewards');
  const endGeo=await rectInPage(page);
  validateGeometry(endGeo,id,label,'victory');
  if(id==='g3-station-1'||id==='g2-station-1')
    await page.screenshot({path:'production-stage2-audit/'+id+'-'+label+'-victory.png',fullPage:true});
  if(id==='g3-station-1'&&label==='phone'){
    assert.ok(tops.every(x=>x>=0),'My Khe question not visible');
  }
  if(id==='g3-station-1'&&label==='desktop'){
    const min=Math.min(...tops),max=Math.max(...tops);
    assert.ok(max-min<=3,'My Khe questions change vertical anchor: '+JSON.stringify(tops));
  }
  return {count:config.questions.length,tops,rewards:earned};
}
async function runHtml(page,id,label){
  await clickFrame(page,'.intro-start');
  for(let i=0;i<5;i++){
    await page.waitForFunction(n=>{
      const root=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      return !!root?.querySelector('.prompt')&&root.querySelector('#hud-stage')?.textContent?.includes('CÂU '+(n+1)+'/');
    },{timeout:18000},i);
    await page.waitForFunction(()=>{
      const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      return [...doc?.querySelectorAll('.choice-photo')??[]].every(x=>x.complete&&x.naturalWidth>0);
    },{timeout:15000});
    const g=await rectInPage(page);
    validateGeometry(g,id,label,'q'+(i+1));
    if(i===0||i===3)await page.screenshot({path:'production-stage2-audit/'+id+'-'+label+'-q'+(i+1)+'.png',fullPage:true});
    if(i===3){
      const rightTexts=['Chỉ huy bảo vệ thành Hà Nội','Đề cao khai dân trí','Khuyến khích đổi mới và mở trường học'];
      for(let left=0;left<3;left++){
        await clickFrame(page,'#l'+left);
        const actual=await page.evaluate(txt=>{
          const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
          return [...doc?.querySelectorAll('[id^="r"]')??[]].find(b=>b.textContent?.trim()===txt)?.id??null;
        },rightTexts[left]);
        assert.ok(actual,'Hoang Dieu right pair missing '+rightTexts[left]);
        await clickFrame(page,'#'+actual);
      }
      await page.waitForFunction(()=>{
        const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
        return Boolean(doc?.querySelector('#confirm:not([disabled])'));
      },{timeout:5000});
      await clickFrame(page,'#confirm');
    }else{
      const correct=await page.evaluate(()=>{
        const frame=document.querySelector('iframe[data-stage2-game-frame]');
        try {return frame.contentWindow.eval('choiceOrder.indexOf(tasks[step].right)');}
        catch {return -1;}
      });
      assert.ok(Number.isInteger(correct)&&correct>=0&&correct<3,'Hoang Dieu correct choice not exposed in legacy HTML');
      await clickFrame(page,'#a'+correct);
    }
  }
  await page.waitForFunction(()=>{
    const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
    return !!doc?.querySelector('.victory .continue-btn');
  },{timeout:20000});
  const earned=await page.evaluate(()=>{
    const doc=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
    return doc?.querySelectorAll('.hud-key.earned').length||0;
  });
  assert.equal(earned,5,'Hoang Dieu 5 keys after victory');
  await page.screenshot({path:'production-stage2-audit/'+id+'-'+label+'-victory.png',fullPage:true});
  return {count:5,rewards:earned};
}
const screens=process.env.EXTRA_ONLY==='1'?[]:[
  {label:'phone',width:390,height:844},
  {label:'desktop',width:1366,height:768}
];
try{
  for(const screen of screens){
    for(const station of ALL_25_STATIONS){
      const id=station.id;
      const {page,errors,readyMs}=await open(id,screen.width,screen.height);
      try {
        assert.equal(Boolean(await page.$('iframe[data-stage2-game-frame]')),id==='g3-station-2',id+': wrong game engine');
        let g=await rectInPage(page);
        validateGeometry(g,id,screen.label,'intro');
        const result=id==='g3-station-2'
          ? await runHtml(page,id,screen.label)
          : await runShared(page,id,station.grade,configs[id],screen.label);
        assert.deepEqual(errors,[],id+' '+screen.label+': JavaScript exceptions');
        results.push({id,grade:station.grade,device:screen.label,readyMs,...result});
        console.log('AUDIT PASSED',id,screen.label,'readyMs',readyMs,'questions',result.count,'rewards',result.rewards);
      }catch(e){
        await page.screenshot({path:'production-stage2-audit/FAILED-'+id+'-'+screen.label+'.png',fullPage:true}).catch(()=>{});
        console.error('AUDIT FAILED',id,screen.label,e?.stack||String(e));
        throw e;
      }finally {await page.close();}
    }
  }
  for(const [grade,id] of [[1,'g1-station-1'],[2,'g2-station-1'],[3,'g3-station-1'],[3,'g3-station-2'],[4,'g4-station-1'],[5,'g5-ky-anh-me-nhu']]){
    for(const [name,width,height] of [['small-phone',320,640],['android',412,915],['ipad',768,1024]]){
      let opened;
      for(let attempt=1;attempt<=3;attempt++){
        try {opened=await open(id,width,height);break;}
        catch(error){console.warn('RETRY EXTRA SCREEN',id,name,attempt,String(error).slice(0,250));if(attempt===3)throw error;await new Promise(resolve=>setTimeout(resolve,1300));}
      }
      const {page,errors,readyMs}=opened;
      try {
        validateGeometry(await rectInPage(page),id,name,'intro');
        if(id==='g3-station-2')await clickFrame(page,'.intro-start');else await clickShared(page,'.intro-start');
        await page.waitForFunction(()=>{
          const frame=document.querySelector('iframe[data-stage2-game-frame]');
          const root=frame?.contentDocument??document.querySelector('[data-shared-stage2]')?.shadowRoot;
          return !!root?.querySelector('.prompt');
        },{timeout:13000});
        // Mobile 320px images often decode after the text prompt is mounted.
        // Wait for the real image decoding before judging broken-image status.
        await page.waitForFunction(()=>{
          const frame=document.querySelector('iframe[data-stage2-game-frame]');
          const root=frame?.contentDocument??document.querySelector('[data-shared-stage2]')?.shadowRoot;
          const images=[...root?.querySelectorAll('.choice-photo')??[]];
          return images.every(img=>img.complete&&img.naturalWidth>0);
        },{timeout:20000});
        validateGeometry(await rectInPage(page),id,name,'question1');
        if(id==='g3-station-1'&&name==='ipad'){
          const dimensions=await page.evaluate(()=>{
            const root=document.querySelector('[data-shared-stage2]')?.shadowRoot;
            const r=el=>{const b=el?.getBoundingClientRect();return b?{top:b.top,bottom:b.bottom,height:b.height,middle:b.top+b.height/2}:null};
            return {
              keys:r(root?.querySelector('.hud-keys')),
              music:r(root?.querySelector('.music-toggle')),
              photoCards:[...root?.querySelectorAll('.answers button:has(.choice-photo)')??[]].map(r),
            };
          });
          assert.ok(dimensions.keys&&dimensions.music,'My Khe iPad toolbar missing');
          assert.ok(Math.abs(dimensions.keys.middle-dimensions.music.middle)<8,'My Khe iPad music wraps below gems');
          assert.equal(dimensions.photoCards.length,3,'My Khe iPad photo cards absent');
          assert.ok(dimensions.photoCards.every(card=>card.height<216),'My Khe iPad cards are too tall');
          console.log('MY KHE IPAD ALIGNMENT PASSED',JSON.stringify(dimensions));
        }
        await page.screenshot({path:'production-stage2-audit/'+id+'-'+name+'.png',fullPage:true});
        assert.deepEqual(errors,[],id+' '+name+': page errors');
        console.log('DEVICE PASSED',id,name,readyMs);
      }finally{await page.close();}
    }
  }
  const ms=results.map(r=>r.readyMs).sort((a,b)=>a-b);
  const report={site,stations:25,deviceRuns:results.length,questionsCompleted:results.reduce((n,r)=>n+r.count,0),medianIntroReadyMs:ms.length?ms[Math.floor(ms.length/2)]:null,p95IntroReadyMs:ms.length?ms[Math.floor(ms.length*.95)]:null,results};
  writeFileSync('production-stage2-audit/results.json',JSON.stringify(report,null,2));
  console.log('LIVE STAGE2 SCREEN AUDIT PASSED',JSON.stringify({site:report.site,deviceRuns:report.deviceRuns,questionsCompleted:report.questionsCompleted,medianReadyMs:report.medianIntroReadyMs,p95ReadyMs:report.p95IntroReadyMs}));
}finally{await browser.close();}
