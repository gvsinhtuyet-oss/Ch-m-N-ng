import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

// Production-like UI smoke test: real guest flow, no protected API mutation.
const origin=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium is required for mobile assistant audit');
mkdirSync('stage2-qa-screenshots',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try {
  for(const [name,width,height] of [['iphone',390,844],['android',412,915],['ipad',810,1080]]){
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const response=await page.goto(origin+'?qa-assistant-mobile=20261109',{waitUntil:'domcontentloaded',timeout:50000});
    assert.equal(response?.status(),200);
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
    await page.waitForSelector('button[aria-label="Khám phá tự do dành cho học sinh"]',{timeout:15000});
    await page.evaluate(()=>document.querySelector('button[aria-label="Khám phá tự do dành cho học sinh"]').click());
    await page.waitForFunction(()=>!![...document.querySelectorAll('button')].find(b=>b.textContent?.includes('Khối 2')),{timeout:15000});
    await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('Khối 2'))?.click());
    await page.waitForSelector('button[aria-label="Mở Trợ lý khám phá Đà Nẵng"]',{timeout:25000});
    const visibility=await page.evaluate(()=>{
      const wrapper=document.querySelector('.discovery-assistant');
      const button=document.querySelector('button[aria-label="Mở Trợ lý khám phá Đà Nẵng"]');
      const css=getComputedStyle(wrapper),r=button.getBoundingClientRect();
      return {display:css.display,visibility:css.visibility,label:wrapper.textContent?.includes('Trợ lý'),
        left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight};
    });
    assert.notEqual(visibility.display,'none',name+' launcher CSS hidden');
    assert.equal(visibility.visibility,'visible',name+' launcher visibility hidden');
    assert.ok(visibility.label,name+' missing assistant label');
    assert.ok(visibility.left>=0 && visibility.right<=visibility.viewportWidth+2
      && visibility.top>=0 && visibility.bottom<=visibility.viewportHeight+2,name+' launcher outside viewport: '+JSON.stringify(visibility));
    await page.click('button[aria-label="Mở Trợ lý khám phá Đà Nẵng"]');
    await page.waitForSelector('[role="dialog"][aria-label="Trợ lý khám phá Đà Nẵng"]',{visible:true,timeout:10000});
    assert.ok(await page.$('textarea[aria-label="Nhập câu hỏi"]'),name+' assistant question input missing');
    await page.screenshot({path:'stage2-qa-screenshots/assistant-'+name+'.png'});
    await page.click('button[aria-label="Đóng trợ lý"]');
    await page.waitForFunction(()=>!document.querySelector('[role="dialog"][aria-label="Trợ lý khám phá Đà Nẵng"]'),{timeout:10000});
    assert.deepEqual(errors,[],name+' uncaught browser errors');
    console.log('MOBILE ASSISTANT',name,'PASS: visible and in viewport, opens and closes');
    await page.close();
  }
}finally{await browser.close();}
