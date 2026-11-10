import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const origin=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium needed to audit the three CHẠM ĐÀ NẴNG access screens');
mkdirSync('access-portal-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const sizes=[['iphone-small',320,640],['iphone',390,844],['android',412,915],['ipad',810,1080],['desktop',1366,768]];
try{
  for(const [name,width,height]of sizes){
    const page=await browser.newPage();
    const pageErrors=[];
    page.on('pageerror',err=>pageErrors.push(err.message));
    await page.setViewport({width,height,isMobile:width<1024,hasTouch:width<1024,deviceScaleFactor:1});
    const response=await page.goto(origin+'?qa-access-portal=20261110',{waitUntil:'domcontentloaded',timeout:50000});
    assert.equal(response?.status(),200);
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
    await page.waitForSelector('[role="dialog"][aria-label="Chọn vai trò"] .cham-access-role-card.student',{timeout:30000});
    const verify=async view=>{
      await page.waitForSelector('.cham-access-sheet',{visible:true,timeout:15000});
      await page.waitForFunction(()=>[...document.querySelectorAll('.cham-access-logo,.cham-access-role-card img,.cham-access-hero-picture')].every(img=>img.complete&&img.naturalWidth>0),{timeout:15000});
      const box=await page.evaluate(()=>{
        const sheet=document.querySelector('.cham-access-sheet'),r=sheet.getBoundingClientRect();
        return {x:r.left,right:r.right,docWidth:document.documentElement.scrollWidth,viewport:innerWidth};
      });
      assert.ok(box.x>=-2&&box.right<=box.viewport+2,name+' '+view+' modal clipped: '+JSON.stringify(box));
      assert.ok(box.docWidth<=box.viewport+5,name+' '+view+' horizontal overflow: '+JSON.stringify(box));
      if(name==='iphone'||name==='desktop') await page.screenshot({path:`access-portal-qa/${view}-${name}.png`,fullPage:true});
    };
    assert.equal(await page.$$('.cham-access-role-card'),2,'Only HS/GV roles should be public');
    await verify('roles');
    await page.click('.cham-access-role-card.student');
    await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập học sinh"]',{timeout:15000});
    assert.ok(await page.$('#cham-access-student-code'));
    assert.ok(await page.$('.cham-access-student-secondary button'));
    await verify('student');
    await page.click('.cham-access-back');
    await page.waitForSelector('.cham-access-role-card.teacher',{timeout:15000});
    await page.click('.cham-access-role-card.teacher');
    await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập giáo viên"]',{timeout:15000});
    assert.ok(await page.$('.cham-access-google [data-testid="google-signin-host"]'));
    assert.ok(await page.$('.cham-access-teacher-guest'));
    await verify('teacher');
    await page.click('.cham-access-account-trigger');
    assert.ok(await page.$('input[type="email"][autocomplete="username"]'));
    assert.ok(await page.$('input[type="password"][autocomplete="current-password"]'));
    assert.deepEqual(pageErrors,[],name+' runtime errors');
    console.log('ACCESS PORTAL',name,'PASS: images load, all 3 screens fit and live controls available');
    await page.close();
  }
} finally { await browser.close(); }
