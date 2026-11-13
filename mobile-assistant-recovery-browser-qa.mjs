import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';
const base=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>p&&existsSync(p));
assert.ok(chrome);mkdirSync('stage2-qa-screenshots',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const click=async(page,text)=>page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&b.textContent.includes(text));if(!b)throw Error('Missing '+text);b.click();},text);
try{
 for(const [name,width,height] of [['iphone',390,844],['android',412,915],['ipad',820,1180]]){
  const context=await browser.createBrowserContext();const page=await context.newPage();
  await page.setViewport({width,height,isMobile:true,hasTouch:true,deviceScaleFactor:1});await page.setCacheEnabled(false);await page.setBypassServiceWorker(true);
  let held;const writes=[];await page.setRequestInterception(true);
  page.on('request',request=>{
   const url=new URL(request.url());
   if(['POST','PUT','PATCH','DELETE'].includes(request.method())){if(url.origin===new URL(base).origin)writes.push(request.method()+' '+url.pathname);void request.abort('blockedbyclient');}
   else if(/\/assets\/DanangAssistantChat[-.].*\.js$/.test(url.pathname)){held=request;}
   else void request.continue();
  });
  await page.goto(base+'?experience=1&qa-mobile-recovery=1',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('button[aria-label="CHẠM ĐỂ KHÁM PHÁ"]');await page.click('button[aria-label="CHẠM ĐỂ KHÁM PHÁ"]');
  await page.waitForSelector('.cham-access-role-card.teacher');await page.click('.cham-access-role-card.teacher');
  await click(page,'Giáo viên / Quản trị trải nghiệm');await page.waitForSelector('#free-explorer-name');await page.type('#free-explorer-name','Giáo viên kiểm thử cục bộ');await page.click('button[type=submit]');
  await page.waitForSelector('button[aria-label="Mở Trợ lý trong khi tải"]',{visible:true,timeout:15000});
  assert.ok(held,'Assistant chunk is deliberately delayed');
  await page.waitForSelector('.header-touch-assistant',{visible:true});
  const bounds=await page.$eval('.header-touch-assistant',b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,viewport:innerWidth};});
  assert.ok(bounds.left>=0&&bounds.right<=bounds.viewport+1&&bounds.width>=44&&bounds.height>=44,'Visible header entry '+name);
  await page.click('button[aria-label="Mở Trợ lý trong khi tải"]');
  await page.waitForFunction(()=>document.body.innerText.includes('Đang mở Trợ lý khám phá'));
  await held.abort('blockedbyclient');
  await page.waitForFunction(()=>document.body.innerText.includes('Trợ lý khám phá chưa tải được.'));
  assert.ok(await page.evaluate(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Khắc phục và tải bản mới')));
  assert.deepEqual(writes,[],'No school API mutations');
  await page.screenshot({path:'stage2-qa-screenshots/assistant-recovery-'+name+'.png'});
  console.log('MOBILE ASSISTANT RECOVERY',name,'PASS: delayed bundle has visible entry; failed bundle offers recovery; zero application write requests');
  await context.close();
 }
}finally{await browser.close();}
