import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import puppeteer from 'puppeteer-core';
import QRCode from 'qrcode';

const origin=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium browser is required for QR scanner QA');
mkdirSync('student-qr-qa',{recursive:true});
const wrong=resolve('student-qr-qa/wrong-website.png');
const revoked=resolve('student-qr-qa/revoked-student.png');
await QRCode.toFile(wrong,'https://different-site.example/#student-code=ABCD-EFGH-2345',{width:420,margin:2});
await QRCode.toFile(revoked,'https://chamdanang-gddp.pages.dev/#student-code=ABCD-EFGH-2345',{width:420,margin:2});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try {
 for(const [name,width,height] of [['iphone',390,844],['ipad',810,1080],['desktop',1366,768]]) {
   const context=await browser.createBrowserContext();
   const page=await context.newPage();
   await page.setViewport({width,height,isMobile:width<1024,hasTouch:width<1024,deviceScaleFactor:1});
   let backendCalls=0;
   await page.setRequestInterception(true);
   page.on('request',async request=>{
     if(new URL(request.url()).pathname==='/api/student/sync/restore' && request.method()==='POST') {
       backendCalls++;
       await request.respond({status:404,contentType:'application/json',body:JSON.stringify({error:'Mã học sinh đã hết hiệu lực.'})});
       return;
     }
     await request.continue();
   });
   const errors=[];page.on('pageerror',err=>errors.push(err.message));
   await page.goto(origin,{waitUntil:'domcontentloaded',timeout:50000});
   await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
   await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
   await page.waitForSelector('[role="dialog"][aria-label="Chọn vai trò"]',{timeout:20000});
   await page.click('.cham-access-role-card.student');
   await page.waitForSelector('[role="dialog"][aria-label="Đăng nhập học sinh"]',{timeout:20000});
   await page.click('.cham-access-qr-button');
   await page.waitForSelector('[role="dialog"][aria-label="Quét mã QR học sinh"]',{timeout:12000});
   assert.ok(await page.$('.cham-qr-actions button'),'Camera retry button is accessible');
   const input=await page.$('.cham-qr-upload input[type=file]');
   assert.ok(input,'Uploading a screenshot/image of QR must be possible');
   await input.uploadFile(wrong);
   await page.waitForFunction(()=>document.querySelector('.cham-qr-error')?.textContent?.includes('không thuộc CHẠM ĐÀ NẴNG'),{timeout:20000});
   assert.equal(backendCalls,0,'Foreign QR link must be rejected client-side without backend request');
   await input.uploadFile(revoked);
   await page.waitForFunction(()=>document.querySelector('.cham-qr-error')?.textContent?.includes('Mã học sinh đã hết hiệu lực.'),{timeout:20000});
   assert.equal(backendCalls,1,'Valid-form QR must be verified only once on the backend');
   assert.equal(await page.evaluate(()=>localStorage.getItem('cham_danang_student_profile_v1')),null,'Invalid backend code must not grant student access');
   assert.deepEqual(errors,[],name+' console runtime errors');
   await page.screenshot({path:'student-qr-qa/scanner-'+name+'.png'});
   await page.click('.cham-qr-header button');
   await page.waitForFunction(()=>!document.querySelector('.cham-qr-overlay'),{timeout:10000});
   console.log('STUDENT QR SCANNER '+name+' PASS: camera/upload UI, reject foreign QR, reject revoked code, no login');
   await context.close();
 }
} finally {await browser.close();}
