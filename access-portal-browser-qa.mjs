import assert from 'node:assert/strict';
import {existsSync, mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const origin = process.env.QA_URL || 'http://127.0.0.1:4173/';
const chrome = [process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium is required for live access UI QA');
mkdirSync('access-portal-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const sizes=[['iphone-small',320,640],['iphone',390,844],['android',412,915],['ipad-portrait',810,1080],['ipad-landscape',1180,820],['desktop',1366,768]];

try {
 for(const [name,width,height] of sizes) {
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.setViewport({width,height,isMobile:width<1024,hasTouch:width<1024,deviceScaleFactor:1});
  const nav=await page.goto(origin+'?qa-responsive-access=20261111',{waitUntil:'domcontentloaded',timeout:50000});
  assert.equal(nav?.status(),200,name+' app navigation');
  await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
  await page.waitForSelector('[role="dialog"][aria-label="Chọn vai trò"]',{timeout:20000});

  async function inspect(view) {
   const panel=await page.$('.cham-access-sheet[data-screen="'+view+'"]');
   assert.ok(panel,name+' '+view+' must use a single real responsive sheet');
   await page.waitForFunction(()=>[...document.querySelectorAll('.cham-access-sheet .cham-access-illustration img')].every(img=>img.complete && img.naturalWidth>500),{timeout:20000});
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.cham-access-sheet .cham-access-illustration img')].map(img=>img.decode().catch(()=>{})));});
   const metrics=await page.evaluate(()=>{
    const sheet=document.querySelector('.cham-access-sheet');
    const rect=sheet.getBoundingClientRect();
    const images=[...sheet.querySelectorAll('.cham-access-illustration img')];
    const logo=sheet.querySelector('.cham-access-wordmark');
    const actions=[...sheet.querySelectorAll('button')].filter(el=>getComputedStyle(el).display!=='none');
    return {
      x:rect.x,right:rect.right,top:rect.top,bottom:rect.bottom,
      width:innerWidth,height:innerHeight,pageWidth:document.documentElement.scrollWidth,
      innerOverflow:sheet.scrollHeight-sheet.clientHeight,
      logo:logo?.textContent,images:images.map(img=>[img.naturalWidth,img.naturalHeight]),
      outOfView:actions.filter(el=>{
        const b=el.getBoundingClientRect();
        return b.width<24||b.height<24||b.left<-1||b.right>innerWidth+1||b.top<-1||b.bottom>innerHeight+1;
      }).map(el=>el.className+' '+el.getAttribute('aria-label')+' '+el.textContent?.slice(0,20)),
    };
   });
   assert.ok(metrics.left>=-2 || metrics.x>=-2,name+' '+view+' clipped left '+JSON.stringify(metrics));
   assert.ok(metrics.right<=width+2 && metrics.bottom<=height+2,name+' '+view+' sheet clipped '+JSON.stringify(metrics));
   assert.ok(metrics.pageWidth<=width+3,name+' '+view+' horizontal overflow '+JSON.stringify(metrics));
   assert.ok(metrics.innerOverflow<=2,name+' '+view+' unexpectedly scrolls '+JSON.stringify(metrics));
   assert.deepEqual(metrics.outOfView,[],name+' '+view+' controls outside screen');
   assert.match(metrics.logo||'',/CHẠMĐÀ NẴNG/,'wordmark must be sharp live text');
   assert.ok(metrics.images.every(([w,h])=>w>=600&&h>=240),'approved dedicated card/banner illustrations are loaded');
   if(view==='role')assert.ok(metrics.bottom-metrics.top<=height*.8,name+' role chooser should be compact');
   await page.screenshot({path:'access-portal-qa/'+view+'-'+name+'.png'});
   return metrics;
  }

  assert.equal((await page.$$('.cham-access-role-card')).length,2,'two role cards');
  await inspect('role');
  await page.click('.cham-access-role-card.student');
  await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập học sinh"]');
  assert.ok(await page.$('#cham-access-student-code'));
  assert.ok(await page.$('.cham-access-qr-button'),'scan QR button in real field');
  assert.ok(await page.$('.cham-access-student-secondary button'));
  await inspect('student');
  await page.click('.cham-access-qr-button');
  await page.waitForSelector('[role="dialog"][aria-label="Quét mã QR học sinh"]',{timeout:20000});
  assert.ok(await page.$('.cham-qr-upload input[type=file]'));
  await page.click('.cham-qr-header button');
  await page.waitForFunction(()=>!document.querySelector('.cham-qr-overlay'));
  await page.click('.cham-access-student-secondary button:last-child');
  await page.waitForSelector('.cham-access-grade-grid button');
  assert.equal((await page.$$('.cham-access-grade-grid button')).length,5,'five guest grades');
  await page.click('.cham-access-back');
  await page.waitForSelector('#cham-access-student-code');
  await page.click('.cham-access-back');
  await page.waitForSelector('.cham-access-role-card.teacher');
  await page.click('.cham-access-role-card.teacher');
  await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập giáo viên"]');
  assert.ok(await page.$('.cham-access-google [data-testid="google-signin-host"]'));
  assert.ok(await page.$('.cham-access-teacher-guest'));
  await inspect('teacher');
  await page.click('.cham-access-account-trigger');
  await page.waitForSelector('.cham-access-account-form input[autocomplete="username"]');
  assert.ok(await page.$('.cham-access-account-form input[autocomplete="current-password"]'));
  assert.ok(await page.$('.cham-access-toggle-password'));
  assert.deepEqual(errors,[],name+' JS runtime errors');
  console.log('RESPONSIVE ACCESS '+name+' PASS: sharp live brand, illustrated real buttons, no scroll, QR, guest, Google, email');
  await page.close();
 }
} finally { await browser.close(); }
