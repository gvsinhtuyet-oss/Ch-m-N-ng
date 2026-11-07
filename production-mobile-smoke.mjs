import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
const executablePath=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(executablePath,'Chrome/Chromium unavailable');
const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const url=process.env.PRODUCTION_URL??'https://chamdanang-gddp.pages.dev/';
mkdirSync('production-mobile-qa',{recursive:true});
try{
 for(const [name,width,height,mobile] of [['iphone',390,844,true],['android',412,915,true],['ipad',768,1024,true],['desktop',1366,768,false]]){
   const page=await browser.newPage();
   const failures=[];
   page.on('pageerror',e=>failures.push(e.message));
   await page.setViewport({width,height,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
   await page.setUserAgent(mobile?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
   const response=await page.goto(url+'?mobile-check=20261107',{waitUntil:'domcontentloaded',timeout:60000});
   await new Promise(resolve=>setTimeout(resolve,4500));
   const info=await page.evaluate(()=>{
     const main=document.querySelector('.landing-cover-main');
     const scene=document.querySelector('.landing-art-scene');
     const title=document.querySelector('.landing-cover-title');
     const video=document.querySelector('.landing-cover-video');
     const actions=document.querySelector('.landing-cover-actions');
     const viewport=document.querySelector('meta[name="viewport"]');
     const get=(el)=>el?{x:Math.round(el.getBoundingClientRect().x),y:Math.round(el.getBoundingClientRect().y),width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height),display:getComputedStyle(el).display,direction:getComputedStyle(el).flexDirection}:null;
     return {
       location:location.href,title:document.title,viewportMeta:viewport?.content??null,
       innerWidth:innerWidth,visualWidth:visualViewport?.width??null,documentWidth:document.documentElement.scrollWidth,
       cssMedia640:matchMedia('(max-width:640px)').matches,cssMedia1023:matchMedia('(max-width:1023px) and (orientation:portrait)').matches,
       scene:get(scene),main:get(main),heading:get(title),video:get(video),actions:get(actions),
       content:document.body.innerText.slice(0,350),scripts:[...document.scripts].filter(x=>x.src).map(x=>x.src.split('/').at(-1)).slice(0,8),
     };
   });
   console.log('LIVE MOBILE DIAGNOSTIC',name,'HTTP',response?.status(),JSON.stringify(info),'PAGE_ERRORS',JSON.stringify(failures));
   await page.screenshot({path:'production-mobile-qa/'+name+'.png',fullPage:true});
   assert.equal(response?.status(),200,name+': live site unavailable');
   if(mobile && width<=412) {
      assert.ok(info.viewportMeta?.includes('width=device-width'),name+': viewport missing');
      assert.ok(info.cssMedia1023,name+': portrait media query not active');
      assert.ok(info.documentWidth<=info.innerWidth+4,name+': page overflow');
      assert.equal(info.main?.direction,'column',name+': desktop landing layout served to mobile');
      assert.ok(info.heading&&info.video&&info.actions,name+': mobile landing content absent');
   }
   await page.close();
 }
}finally{await browser.close()}