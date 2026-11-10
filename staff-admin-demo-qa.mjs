import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const url=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium is required for role picker and Admin auth QA');
mkdirSync('staff-admin-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try{
  for(const [device,width,height] of [['desktop',1366,768],['phone',390,844]]){
    const page=await browser.newPage();
    if(process.env.LIVE_READ_ONLY==='true'){
      await page.setRequestInterception(true);
      page.on('request',request=>{
        if(['POST','PUT','PATCH','DELETE'].includes(request.method()))request.abort('blockedbyclient');
        else request.continue();
      });
    }
    const errors=[],protectedWrites=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{
      const p=new URL(request.url()).pathname;
      if(['POST','PUT','PATCH','DELETE'].includes(request.method()) && /^\/api\/(admin|teacher|content|auth)\//.test(p))
        protectedWrites.push(request.method()+' '+p);
    });
    await page.setViewport({width,height,isMobile:width<800,hasTouch:width<800,deviceScaleFactor:1});
    const response=await page.goto(url+'?qa-real-admin-only=20261110',{waitUntil:'domcontentloaded',timeout:50000});
    if(response)assert.equal(response.status(),200,'App route failed');
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'));
      assertButton(button,'Main cover entry');button.click();
      function assertButton(button,label){if(!button)throw Error('Missing '+label);}
    });
    await page.waitForSelector('[role="dialog"][aria-label="Chọn vai trò và đăng nhập"]',{timeout:15000});
    const roles=await page.evaluate(()=>{
      const dialog=document.querySelector('[role="dialog"]');
      const text=dialog?.textContent||'';
      return {
        roleText:text,
        demoButtons:[...dialog.querySelectorAll('button')].filter(b=>/Quản trị.*Demo|Khám phá tự do dành cho quản trị/i.test((b.textContent||'')+' '+(b.getAttribute('aria-label')||''))).length,
        staff:!![...dialog.querySelectorAll('section')].find(s=>s.textContent?.includes('GIÁO VIÊN / QUẢN TRỊ')),
        student:!![...dialog.querySelectorAll('section')].find(s=>s.textContent?.includes('HỌC SINH')),
        overflow:document.documentElement.scrollWidth-innerWidth,
      };
    });
    assert.ok(roles.staff&&roles.student,'student and actual staff entry must remain');
    assert.equal(roles.demoButtons,0,'Public Admin Demo button still accessible');
    assert.doesNotMatch(roles.roleText,/Xem thử Quản trị\s*\(Demo\)/);
    assert.ok(roles.overflow<=5,device+' overflow '+roles.overflow);
    await page.evaluate(()=>{
      const section=[...document.querySelectorAll('[role="dialog"] section')].find(s=>s.textContent?.includes('GIÁO VIÊN / QUẢN TRỊ'));
      const button=[...section.querySelectorAll('button')].find(b=>b.textContent?.includes('Đăng nhập'));
      if(!button)throw Error('No staff login button');button.click();
    });
    await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập quản trị và giáo viên"]',{timeout:15000});
    const auth=await page.evaluate(()=>({
      email:!!document.querySelector('input[type="email"][autocomplete="username"]'),
      password:!!document.querySelector('input[type="password"][autocomplete="current-password"]'),
      adminPanel:!!document.querySelector('.admin-workspace'),
      fakeAdminLink:!!document.querySelector('button[aria-label="Khám phá tự do dành cho quản trị"]'),
      overflow:document.documentElement.scrollWidth-innerWidth,
    }));
    assert.ok(auth.email&&auth.password,'Real staff auth form must be reachable');
    assert.equal(auth.adminPanel,false,'An anonymous visitor must not enter protected Admin');
    assert.equal(auth.fakeAdminLink,false,'Anonymous Admin Demo entry must be absent');
    assert.ok(auth.overflow<=5,device+' auth overflow '+auth.overflow);
    assert.deepEqual(protectedWrites,[],'Role selection must not write protected data');
    assert.deepEqual(errors,[],'No uncaught browser errors');
    await page.screenshot({path:'staff-admin-qa/admin-login-'+device+'.png',fullPage:true});
    console.log('ROLE QA',device,'PASS: no Admin Demo, real staff login, protected Admin, no writes');
    await page.close();
  }
}finally{await browser.close();}
