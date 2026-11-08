import assert from 'node:assert/strict';
import {existsSync,mkdirSync} from 'node:fs';
import puppeteer from 'puppeteer-core';
const url=process.env.PUBLIC_URL||'https://chamdanang-gddp.pages.dev/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium is missing');
mkdirSync('staff-live-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
try{
  for(const [name,width,height] of [['desktop',1366,768],['phone',390,844]]){
    const page=await browser.newPage();
    const exceptions=[];
    page.on('pageerror',e=>exceptions.push(e.message));
    await page.setViewport({width,height,isMobile:width<800,hasTouch:width<800,deviceScaleFactor:1});
    const r=await page.goto(url+'?qa-staff-deployment=20261108',{waitUntil:'domcontentloaded',timeout:50000});
    assert.equal(r?.status(),200,'public site HTTP status');
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:30000});
    const open=await page.evaluate(()=>{
      const button=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'));
      if(!button)return false;button.click();return true;
    });
    assert.ok(open,'cannot open role picker');
    await page.waitForSelector('button[aria-label="Khám phá tự do dành cho giáo viên"]',{timeout:12000});
    await page.evaluate(()=>document.querySelector('button[aria-label="Khám phá tự do dành cho giáo viên"]').click());
    await page.waitForSelector('.teacher-workspace .teacher-sidebar',{timeout:25000});
    await page.waitForSelector('.teacher-workspace .teacher-page-hero',{timeout:25000});
    const info=await page.evaluate(()=>{
      const root=document.querySelector('.teacher-workspace');
      const hero=document.querySelector('.teacher-page-hero');
      const nav=document.querySelector('.teacher-sidebar');
      return {
        title:hero?.textContent?.slice(0,300),navigation:nav?.textContent?.slice(0,800),
        blueSidebar:!!nav,hero:!!hero,
        documentOverflow:document.documentElement.scrollWidth-window.innerWidth,
        bg:getComputedStyle(document.querySelector('.game-content.staff-workspace')??document.body).backgroundColor,
        menuButton:!!document.querySelector('[aria-label="Điều hướng giáo viên"]'),
      };
    });
    console.log('LIVE TEACHER DEMO APPROVED UI',name,JSON.stringify(info));
    assert.ok(info.blueSidebar&&info.hero,'approved Teacher UI not on production');
    for(const s of ['Dạy học ngay','Kế hoạch bài dạy','Lớp của tôi','Kết quả học tập','Kho học liệu','Danh mục 25 trạm'])
      assert.ok(info.navigation.includes(s),'missing teacher navigation '+s);
    assert.ok(info.documentOverflow<=5,'teacher page overflow on '+name);
    assert.deepEqual(exceptions,[],'public Teacher demo JavaScript exceptions');
    await page.screenshot({path:'staff-live-qa/teacher-demo-'+name+'.png',fullPage:true});
    await page.close();
  }
  console.log('PUBLIC PRODUCTION TEACHER DEMO QA PASSED (desktop + phone)');
} finally {await browser.close();}
