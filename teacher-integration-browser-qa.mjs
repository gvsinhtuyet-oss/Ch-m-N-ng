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
    console.log('Teacher integration QA',device,'PASS: seeded school/book/year, reviewed suggestions, add and teach, local-only draft, no protected writes');
    await page.close();
  }
} finally {await browser.close();}
