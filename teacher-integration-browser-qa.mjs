import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const url=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium required for teacher integration planner QA');
mkdirSync('teacher-plan-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});

const clickButton=async(page,text)=>
  page.evaluate(label=>{
    const candidates=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length>0);
    const target=candidates.find(x=>x.textContent?.trim().includes(label));
    if(!target)throw Error('Không tìm thấy nút '+label);
    target.click();
  },text);

try{
  for(const [device,width,height] of [['desktop',1366,900],['phone',390,844]]){
    const page=await browser.newPage();
    const pageErrors=[],serverWrites=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request',request=>{
      const method=request.method();
      if(['POST','PUT','PATCH','DELETE'].includes(method)){
        serverWrites.push(method+' '+new URL(request.url()).pathname);
        request.abort('blockedbyclient');
      }else request.continue();
    });
    await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width<800,hasTouch:width<800});
    const response=await page.goto(url+'?qa-teacher-integration=20261114',{waitUntil:'domcontentloaded',timeout:60000});
    if(response)assert.equal(response.status(),200);
    await page.waitForFunction(()=>document.body.textContent?.includes('CHẠM ĐỂ KHÁM PHÁ'),{timeout:40000});
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='CHẠM ĐỂ KHÁM PHÁ');
      if(!button)throw Error('Cover button not found');button.click();
    });
    await page.waitForSelector('.cham-access-role-card.teacher',{timeout:20000});
    await page.click('.cham-access-role-card.teacher');
    await page.waitForSelector('.cham-access-teacher-guest',{timeout:20000});
    await page.click('.cham-access-teacher-guest');
    await page.waitForSelector('#free-explorer-name',{timeout:10000});
    await page.type('#free-explorer-name','Giáo viên kiểm thử');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.teacher-workspace',{timeout:30000});
    if(device==='phone'){
      const toggle=await page.$('button[aria-controls="teacher-navigation"]');
      assert.ok(toggle);await toggle.click();
    }
    await page.waitForSelector('#teacher-navigation button');
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('#teacher-navigation button')].find(x=>x.textContent?.includes('Kế hoạch bài dạy'));
      if(!button)throw Error('Teacher workspace navigation missing');
      button.click();
    });
    await page.waitForFunction(()=>document.body.textContent?.includes('Kế hoạch tích hợp của tôi'),{timeout:15000});
    const basics=await page.evaluate(()=>{
      const section=[...document.querySelectorAll('section')].find(x=>x.querySelector('h2')?.textContent==='Kế hoạch tích hợp của tôi');
      if(!section)throw Error('Plan section missing');
      const labels=[...section.querySelectorAll('label')];
      const value=(label)=>{
        const element=labels.find(el=>el.textContent?.trim().startsWith(label));
        return element?.querySelector('input,select')?.value;
      };
      return {school:value('Trường'),book:value('Bộ sách'),year:value('Năm học'),
        suggest:section.textContent?.includes('Chọn bài trong chương trình'),
        hasPrivateDemo:section.textContent?.includes('Giáo viên tự do · Chế độ trải nghiệm'),
        realSaveButtons:[...section.querySelectorAll('button')].filter(b=>/Lưu kế hoạch vào tài khoản/.test(b.textContent||'')).length,
      };
    });
    assert.equal(basics.school,'Trường Tiểu học Trần Đại Nghĩa');
    assert.equal(basics.book,'Kết nối tri thức với cuộc sống');
    assert.equal(basics.year,'2026-2027');
    assert.equal(basics.suggest,true);
    assert.equal(basics.hasPrivateDemo,true);
    assert.equal(basics.realSaveButtons,0,'Demo must never have an account-sync button');

    // Pick grade 2 and one curated, textbook-reviewed lesson.
    await page.evaluate(()=>{
      const label=[...document.querySelectorAll('label')].find(x=>x.textContent?.trim().startsWith('Khối lớp'));
      const select=label?.querySelector('select');
      if(!select)throw Error('Grade selector missing');
      select.value='2';select.dispatchEvent(new Event('change',{bubbles:true}));
    });
    await page.waitForSelector('div.max-h-72 button[aria-pressed]',{timeout:10000});
    await page.evaluate(()=>{
      const button=document.querySelector('div.max-h-72 button[aria-pressed]');
      if(!button)throw Error('No textbook-reviewed suggestions');
      button.click();
    });
    await page.waitForFunction(()=>document.body.textContent?.includes('Đã đối chiếu tên bài SGK'),{timeout:10000});
    await clickButton(page,'Thêm vào kế hoạch để duyệt');
    await page.waitForFunction(()=>document.body.textContent?.includes('Bảng kế hoạch tích hợp'),{timeout:10000});
    const draft=await page.evaluate(()=>{
      const lib=JSON.parse(localStorage.getItem('cham-teacher-integration-drafts-v2:teacher-demo')||'{}');
      return {records:lib['2026-2027|2']?.records?.length||0,grade:lib['2026-2027|2']?.grade,keys:Object.keys(lib)};
    });
    assert.ok(draft.records>=1,'Demo draft must auto-save locally');
    assert.equal(draft.grade,2);
    await clickButton(page,'Dạy bài này');
    await page.waitForFunction(()=>document.body.textContent?.includes('Dạy bài đã chọn'),{timeout:15000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+8),false,'Horizontal overflow in '+device);
    assert.deepEqual(pageErrors,[],'Browser runtime errors '+device);
    assert.ok(!serverWrites.some(s=>/^PUT |^POST /.test(s)&&/\/api\/teacher\/workspace|\/api\/admin\//.test(s)),
      'Demo must not sync a plan or write Admin data');
    await page.screenshot({path:'teacher-plan-qa/'+device+'.png',fullPage:false});
    // Same "Lớp của tôi · Mã QR" navigation as an authenticated Teacher.
    if(device==='phone')await page.click('button[aria-controls="teacher-navigation"]');
    await page.evaluate(()=>{
      const button=[...document.querySelectorAll('#teacher-navigation button')]
        .find(x=>x.textContent?.includes('Lớp của tôi · Mã QR'));
      if(!button)throw Error('Missing shared QR classroom menu');
      button.click();
    });
    await page.waitForFunction(()=>document.body.textContent?.includes('Thẻ QR học sinh'),{timeout:15000});
    await clickButton(page,'Tạo thẻ QR cho');
    await page.waitForSelector('img[alt^="Mã QR trải nghiệm"]',{timeout:25000});
    const demoCard=await page.evaluate(()=>({
      count:document.querySelectorAll('img[alt^="Mã QR trải nghiệm"]').length,
      png:document.querySelector('img[alt^="Mã QR trải nghiệm"]')?.getAttribute('src')?.startsWith('data:image/png'),
      hasZip:document.body.textContent?.includes('Tải trọn bộ thẻ QR (ZIP)'),
    }));
    assert.ok(demoCard.count>=1&&demoCard.png&&demoCard.hasZip,'Demo QR card must render as PNG and offer ZIP');
    assert.deepEqual(pageErrors,[],'QR classroom page errors');

    // Scan a fictional QR using its public, deliberately noncredential deep-link.
    const qrPage=await browser.newPage();
    const qrWrites=[],qrErrors=[];
    qrPage.on('pageerror',error=>qrErrors.push(error.message));
    await qrPage.setRequestInterception(true);
    qrPage.on('request',request=>{
      if(['POST','PUT','PATCH','DELETE'].includes(request.method())){
        qrWrites.push(request.method()+' '+new URL(request.url()).pathname);
        request.abort('blockedbyclient');
      }else request.continue();
    });
    await qrPage.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    await qrPage.goto(url.split('?')[0]+'#demo-student=g2&n=1&c=2%2F24',{waitUntil:'domcontentloaded',timeout:60000});
    await qrPage.waitForFunction(()=>document.body.textContent?.includes('Thẻ QR TRẢI NGHIỆM'),{timeout:20000});
    await qrPage.evaluate(()=>{
      const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='CHẠM ĐỂ KHÁM PHÁ');
      if(!btn)throw Error('Missing cover entry for demo QR');btn.click();
    });
    await qrPage.waitForFunction(()=>document.body.textContent?.includes('Học sinh 01')&&document.body.textContent?.includes('Khối 2'),{timeout:30000});
    assert.ok(!qrWrites.some(s=>/\/api\/(?:effectiveness|student\/sync|teacher|admin)/.test(s)),
      'Demo QR must never hit protected or analytics write routes');
    assert.deepEqual(qrErrors,[],'Demo QR guest errors');
    await qrPage.screenshot({path:'teacher-plan-qa/qr-entry-'+device+'.png',fullPage:false});
    await qrPage.close();
    console.log('Teacher integration QA',device,'PASS: unified menu, verified integration, ZIP/PNG QR, local-only QR scan, no backend writes');
    await page.close();
  }
} finally {await browser.close();}
