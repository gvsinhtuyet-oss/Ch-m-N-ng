import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';

const origin=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium needed to test QR entry');
mkdirSync('student-qr-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
async function makePage(viewport){
 // Each scenario must have its own origin storage. Otherwise the QR success
 // test leaves the previous learner in localStorage for the expired QR case.
 const context=await browser.createBrowserContext();
 const page=await context.newPage();
 await page.setViewport({...viewport,deviceScaleFactor:1});
 await page.setRequestInterception(true);
 return page;
}
try{
 // Scanning on iPhone opens the regular cover and video. No login request
 // occurs until the student taps the normal button.
 const page=await makePage({width:390,height:844,isMobile:true,hasTouch:true});
 let posts=0;
 page.on('request',async request=>{
   if(new URL(request.url()).pathname==='/api/student/sync/restore'&&request.method()==='POST'){
     posts++;
     await request.respond({status:200,contentType:'application/json',body:JSON.stringify({
       profile:{id:'student-qa-1',name:'Học sinh thử nghiệm',grade:2,className:'2/24',classId:'qa-class-id'},
       progress:{},
     })});return;
   }
   await request.continue();
 });
 await page.goto(new URL('/#student-code=ABCD-EFGH-IJKL',origin),{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
 await page.waitForFunction(()=>location.hash==='',{timeout:10000});
 assert.equal(posts,0,'QR must not log in before the student taps Start');
 assert.ok(await page.$('iframe[title="Video giới thiệu CHẠM ĐÀ NẴNG"]'),'intro video remains available');
 assert.equal(await page.$('input[type="password"]'),null,'no student login modal before Start');
 await page.screenshot({path:'student-qr-qa/qr-welcome-iphone.png'});
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cham_danang_student_profile_v1')||'null')?.id==='student-qa-1',{timeout:30000});
 await page.waitForFunction(()=>!document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:20000});
 assert.equal(posts,1,'One student restore must occur after the tap');
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('cham_danang_student_profile_v1')));
 assert.equal(restored.grade,2);
 assert.equal(restored.className,'2/24');
 assert.equal(restored.classId,'qa-class-id');
 assert.equal(restored.syncCode,'ABCDEFGHIJKL');
 await page.screenshot({path:'student-qr-qa/qr-student-home-iphone.png'});
 console.log('STUDENT QR IPHONE PASS: intro video -> one tap -> managed student home, no role or grade selection');
 await page.close();

 // Failed/rotated credentials must never create a guest or wrong student.
 const failed=await makePage({width:1366,height:768,isMobile:false,hasTouch:false});
 failed.on('request',async request=>{
   if(new URL(request.url()).pathname==='/api/student/sync/restore'&&request.method()==='POST'){
     await request.respond({status:404,contentType:'application/json',body:JSON.stringify({error:'Mã học sinh đã hết hiệu lực.'})});
     return;
   }
   await request.continue();
 });
 await failed.goto(new URL('/#student-code=ZZZZ-YYYY-XXXX',origin),{waitUntil:'domcontentloaded',timeout:45000});
 await failed.waitForFunction(()=>location.hash==='',{timeout:10000});
 await failed.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
 await failed.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
 await failed.waitForFunction(()=>document.body.textContent?.includes('Mã học sinh đã hết hiệu lực.'),{timeout:20000});
 assert.ok(await failed.$('input[type="password"]'),'failed QR must offer a manual code retry');
 assert.equal(await failed.evaluate(()=>localStorage.getItem('cham_danang_student_profile_v1')),null);
 console.log('STUDENT QR EXPIRED PASS: safe retry, no fabricated student profile');
 await failed.close();

 const regular=await makePage({width:390,height:844,isMobile:true,hasTouch:true});
 regular.on('request',request=>request.continue());
 await regular.goto(origin,{waitUntil:'domcontentloaded',timeout:45000});
 await regular.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
 await regular.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'))?.click());
 await regular.waitForSelector('[role="dialog"][aria-label="Chọn vai trò"] .role-teacher',{timeout:15000});
 console.log('REGULAR ENTRY PASS: non-QR guest/teacher/admin role selection preserved');
 await regular.close();
}finally{
 await browser.close();
}
