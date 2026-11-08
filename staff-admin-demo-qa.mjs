import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const url=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium browser is required for Admin Demo QA');
mkdirSync('staff-admin-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try {
  for (const [device,width,height] of [['desktop',1366,768],['phone',390,844]]) {
    const page=await browser.newPage();
    const errors=[],protectedWrites=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{
      const p=new URL(r.url()).pathname;
      if(['POST','PUT','PATCH','DELETE'].includes(r.method()) && /^\\/api\\/(admin|teacher|content|auth)\\//.test(p))
        protectedWrites.push(r.method()+' '+p);
    });
    await page.setViewport({width,height,isMobile:width<800,hasTouch:width<800,deviceScaleFactor:1});
    const response=await page.goto(url+'?qa-admin-demo=20261108',{waitUntil:'domcontentloaded',timeout:50000});
    assert.equal(response?.status(),200);
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    assert.ok(await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'));
      b?.click();return !!b;
    }),'missing entry');
    await page.waitForSelector('button[aria-label="Khám phá tự do dành cho quản trị"]',{timeout:15000});
    await page.evaluate(()=>document.querySelector('button[aria-label="Khám phá tự do dành cho quản trị"]').click());
    await page.waitForSelector('.admin-workspace .admin-sidebar',{timeout:25000});
    await page.waitForSelector('.admin-workspace .admin-page-hero',{timeout:25000});
    const view=await page.evaluate(()=>({
      title:document.querySelector('.admin-page-hero')?.textContent||'',
      note:document.querySelector('.admin-page-hero [role="note"]')?.textContent||'',
      nav:document.querySelector('nav[aria-label="Điều hướng quản trị trải nghiệm"]')?.textContent||'',
      overflow:document.documentElement.scrollWidth-innerWidth
    }));
    for(const tab of ['Tổng quan','Quản lý 25 trạm','Giao diện','Xem thử bài học'])
      assert.ok(view.nav.includes(tab),'missing demo section: '+tab);
    assert.match(view.note,/không thể xuất bản dữ liệu chung/i);
    assert.ok(view.overflow<=5,device+' horizontal overflow '+view.overflow);
    if(device==='phone') {
      const toggle=await page.$('button[aria-controls="admin-demo-navigation"]');
      assert.ok(toggle,'mobile admin menu missing');
      await toggle.click();
      assert.equal(await page.$eval('button[aria-controls="admin-demo-navigation"]',e=>e.getAttribute('aria-expanded')),'true');
    }
    await page.evaluate(()=>{
      const nav=document.querySelector('nav[aria-label="Điều hướng quản trị trải nghiệm"]');
      [...nav.querySelectorAll('button')].find(b=>b.textContent?.includes('Giao diện'))?.click();
    });
    await page.waitForFunction(()=>document.body.textContent?.includes('Quản lý hình nền theo từng khu vực'),{timeout:15000});
    assert.ok(await page.evaluate(()=>[...document.querySelectorAll('button')].some(b=>b.textContent?.includes('Xem trước và lưu trên máy'))));
    assert.equal(await page.evaluate(()=>[...document.querySelectorAll('button')].some(b=>b.textContent?.trim()==='Xuất bản giao diện')),false,'Admin Demo must not publish');
    await page.screenshot({path:'staff-admin-qa/admin-demo-'+device+'.png',fullPage:true});
    assert.deepEqual(protectedWrites,[],'Demo attempted protected API writes');
    assert.deepEqual(errors,[],'uncaught browser errors');
    console.log('ADMIN DEMO',device,'PASS: live route, four sections, local-only guard, theme screen, overflow '+view.overflow);
    await page.close();
  }
} finally {await browser.close();}
