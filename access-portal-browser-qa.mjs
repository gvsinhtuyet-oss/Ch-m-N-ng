import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const origin=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium needed for approved access screens');
mkdirSync('access-portal-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const sizes=[['iphone-small',320,640],['iphone',390,844],['android',412,915],['ipad',810,1080],['desktop',1366,768]];
try {
  for(const [name,width,height] of sizes) {
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width,height,isMobile:width<1024,hasTouch:width<1024,deviceScaleFactor:1});
    const response=await page.goto(origin+'?qa-approved-access=20261111',{waitUntil:'domcontentloaded',timeout:50000});
    assert.equal(response?.status(),200,'App navigation');
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
    await page.waitForSelector('[role="dialog"][aria-label="Chọn vai trò"]',{timeout:30000});
    const mobile=width<1024;
    const student=mobile?'.role-student':'.cham-access-role-card.student';
    const teacher=mobile?'.role-teacher':'.cham-access-role-card.teacher';
    const back=mobile?'.student-back':'.cham-access-back';
    async function verify(view) {
      const selector=mobile?'.approved-mobile-stage':'.cham-access-sheet';
      await page.waitForSelector(selector,{visible:true,timeout:15000});
      // React preserves the poster container across view changes. Wait for the
      // *new* approved image to load; otherwise fast Android emulation races the image request.
      if (mobile) await page.waitForFunction(expected=>{
        const stage=document.querySelector('.approved-mobile-stage');
        const img=stage?.querySelector('.approved-mobile-art');
        return stage?.getAttribute('data-screen')===expected && !!img?.complete && (img.naturalWidth||0)>0;
      },{timeout:20000},view);
      else await page.waitForFunction(()=>[...document.querySelectorAll('.cham-access-sheet img')].every(img=>img.complete&&img.naturalWidth>0),{timeout:20000});
      const box=await page.evaluate(selector=>{
        const elem=document.querySelector(selector);
        const rect=elem.getBoundingClientRect();
        const imgs=[...elem.querySelectorAll('img')];
        return {x:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,docWidth:document.documentElement.scrollWidth,
          viewportWidth:innerWidth,viewportHeight:innerHeight,imgsReady:imgs.every(img=>img.complete&&img.naturalWidth>0),
          artFit:elem.querySelector('.approved-mobile-art')?getComputedStyle(elem.querySelector('.approved-mobile-art')).objectFit:null};
      },selector);
      assert.ok(box.imgsReady,name+' '+view+' image failed');
      assert.ok(box.x>=-2 && box.right<=box.viewportWidth+2,name+' '+view+' width clipped '+JSON.stringify(box));
      assert.ok(box.top>=-2 && box.bottom<=box.viewportHeight+2,name+' '+view+' height clipped '+JSON.stringify(box));
      assert.ok(box.docWidth<=box.viewportWidth+5,name+' '+view+' horizontal overflow '+JSON.stringify(box));
      if(mobile)assert.equal(box.artFit,'contain',name+' '+view+' must not crop approved image');
      if(name==='iphone'||name==='desktop')await page.screenshot({path:`access-portal-qa/${view}-${name}.png`,fullPage:true});
    }
    await page.waitForSelector(student,{timeout:15000});
    await page.waitForSelector(teacher,{timeout:15000});
    assert.equal(await page.$$(mobile?'.role-student, .role-teacher':'.cham-access-role-card').then(a=>a.length),2,'Exactly HS/GV roles');
    await verify('roles');
    await page.click(student);
    await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập học sinh"]',{timeout:15000});
    assert.ok(await page.$(mobile?'#approved-student-code':'#cham-access-student-code'));
    assert.ok(await page.$(mobile?'.student-guest':'.cham-access-student-secondary button'));
    await verify('student');
    await page.click(back);
    await page.waitForSelector(teacher,{timeout:15000});
    await page.click(teacher);
    await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập giáo viên"]',{timeout:15000});
    assert.ok(await page.$(mobile?'.approved-mobile-google [data-testid="google-signin-host"]':'.cham-access-google [data-testid="google-signin-host"]'));
    assert.ok(await page.$(mobile?'.teacher-free':'.cham-access-teacher-guest'));
    await verify('teacher');
    await page.click(mobile?'.teacher-expand':'.cham-access-account-trigger');
    assert.ok(await page.$('input[type="email"][autocomplete="username"]'));
    assert.ok(await page.$('input[type="password"][autocomplete="current-password"]'));
    assert.deepEqual(errors,[],name+' runtime errors');
    console.log('ACCESS PORTAL',name,'PASS: 3 approved screens, no crop, live login, no clipping');
    await page.close();
  }
} finally { await browser.close(); }
