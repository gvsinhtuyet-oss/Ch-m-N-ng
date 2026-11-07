import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>p&&existsSync(p));
assert.ok(chrome,'Chrome unavailable');
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const base=process.env.STAGE2_QA_URL??'http://127.0.0.1:4173';
mkdirSync('stage2-qa-screenshots',{recursive:true});

try{
  for(const [name,width,height] of [['iphone-375',375,667],['iphone-390',390,844],['android-412',412,915],['ipad-768',768,1024],['desktop-1366',1366,768]]){
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width,height,isMobile:width<=820,hasTouch:width<=820,deviceScaleFactor:1});
    await page.goto(base+'/?stage2-qa=g3-station-1',{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForFunction(()=>{
      const d=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      return !!d?.getElementById('cham-my-khe-unboxed-intro')&&!!d.querySelector('.intro-screen .intro-start');
    },{timeout:30000});
    const intro=await page.evaluate(()=>{
      const f=document.querySelector('iframe[data-stage2-game-frame]');
      const d=f?.contentDocument;
      const scene=d?.querySelector('.scene');
      const shell=d?.querySelector('.shell');
      const panel=d?.querySelector('.panel');
      const title=d?.querySelector('.intro-screen h2');
      const button=d?.querySelector('.intro-start');
      const r=e=>{const b=e?.getBoundingClientRect();return b?{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}:null};
      const css=panel?getComputedStyle(panel):null;
      const hero=shell?getComputedStyle(shell,'::before'):null;
      return{
        title: title?.textContent,panel:r(panel),button:r(button),shell:r(shell),
        intro:r(d?.querySelector('.intro-screen')),
        background:css?.backgroundColor,border:css?.borderTopWidth,shadow:css?.boxShadow,
        heroHeight:parseFloat(hero?.height??'0')||0,heroDisplay:hero?.display,
        artwork:hero?.backgroundImage?.includes('url('),viewport:f?.contentWindow?.innerWidth,
        scrollWidth:d?.documentElement.scrollWidth,
        sceneBackground:scene?getComputedStyle(scene).backgroundImage:'',
        toolbar:r(d?.querySelector('.shell > .top')),
        gems:r(d?.querySelector('.shell > .top .gems')),
        music:r(d?.querySelector('.shell > .top .music-toggle')),
        titleText:title?.textContent,
      };
    });
    console.log('INTRO DESIGN',name,JSON.stringify(intro));
    assert.match(intro.title??'',/HÀNH TRÌNH TÌM NGỌC BIỂN/,'intro heading retained');
    assert.equal(intro.border,'0px',name+': large cream frame border remains');
    assert.equal(intro.background,'rgba(0, 0, 0, 0)',name+': large cream background remains');
    assert.equal(intro.shadow,'none',name+': large frame shadow remains');
    assert.ok(intro.panel&&intro.button,name+': intro and start control missing');
    if(width<=650) {
      assert.ok(intro.toolbar&&intro.gems&&intro.music,name+': three live V18-style toolbar controls missing');
      assert.ok(intro.toolbar.bottom < intro.panel.y,name+': controls must appear above title and intro');
      assert.ok(intro.music.right <= width+2,name+': music button exceeds viewport');
    }

    assert.ok(intro.panel.y>=(width<=650?intro.heroHeight+35:245),name+': intro covers bitmap title');
    assert.ok(intro.scrollWidth<=(intro.viewport??0)+4,name+': horizontal overflow');
    await page.screenshot({path:'stage2-qa-screenshots/my-khe-intro-'+name+'.png',fullPage:true});

    const clicked=await page.evaluate(()=>{
      const d=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      const button=d?.querySelector('.intro-start');
      if(!button)return false;
      button.click();return true;
    });
    assert.equal(clicked,true,name+': start button missing');
    await page.waitForFunction(()=>{
      const d=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      return !!d?.querySelector('.panel .prompt')&&!d.querySelector('.intro-screen');
    },{timeout:10000});
    const question=await page.evaluate(()=>{
      const d=document.querySelector('iframe[data-stage2-game-frame]')?.contentDocument;
      const panel=d?.querySelector('.panel');
      const css=panel?getComputedStyle(panel):null;
      return{
        prompt:!!d?.querySelector('.panel .prompt'),
        choices:d?.querySelectorAll('.panel .answers button').length??0,
        border:css?.borderTopWidth,
        background:css?.backgroundColor,
        music:!!d?.querySelector('.music-toggle'),
      };
    });
    console.log('QUESTION INTACT',name,JSON.stringify(question));
    assert.ok(question.prompt&&question.choices>0,name+': first question is missing');
    assert.notEqual(question.border,'0px',name+': question card border accidentally removed');
    assert.ok(question.music,name+': sound control lost');
    assert.deepEqual(errors,[],name+': JavaScript errors');
    await page.screenshot({path:'stage2-qa-screenshots/my-khe-question-'+name+'.png',fullPage:true});
    await page.close();
  }
  console.log('MY KHE UNBOXED INTRO QA PASSED: phone, tablet, desktop and question handoff');
}finally{await browser.close()}
