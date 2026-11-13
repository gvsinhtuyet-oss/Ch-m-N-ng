import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import {resolve} from 'node:path';
import ExcelJS from 'exceljs';
import {Document,Packer,Paragraph,Table,TableRow,TableCell} from 'docx';

const url=process.env.QA_URL||'http://127.0.0.1:4173/';
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(x=>x&&existsSync(x));
assert.ok(chrome,'Chromium required for teacher integration planner QA');
mkdirSync('teacher-plan-qa',{recursive:true});
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});

const auditResults=[];
const fixtureHeaders=['Môn học','Tên bài','Nội dung tích hợp'];
const fixtureRow=['TNXH','Bài nhập để kiểm thử','Nội dung thử cục bộ, giáo viên cần đối chiếu'];
const fixtureBook=new ExcelJS.Workbook();fixtureBook.addWorksheet('Thông tin').addRow(['Bản kiểm thử']);fixtureBook.addWorksheet('Kế hoạch').addRows([fixtureHeaders,fixtureRow]);
const excelFixture=resolve('teacher-plan-qa/kiem-thu-nhap.xlsx');await fixtureBook.xlsx.writeFile(excelFixture);
const wordFixture=resolve('teacher-plan-qa/kiem-thu-nhap.docx');
writeFileSync(wordFixture,await Packer.toBuffer(new Document({sections:[{children:[new Table({rows:[fixtureHeaders,fixtureRow].map(row=>new TableRow({children:row.map(text=>new TableCell({children:[new Paragraph(text)]}))}))})]}]})));
const waitDownload=async(dir,suffix)=>{for(let i=0;i<100;i++){if(readdirSync(dir).some(n=>n.endsWith(suffix)))return;await new Promise(r=>setTimeout(r,100));}throw Error('Download missing '+suffix);};

const clickButton=async(page,text)=>
  page.evaluate(label=>{
    const candidates=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length>0);
    const target=candidates.find(x=>x.textContent?.trim().includes(label));
    if(!target)throw Error('Không tìm thấy nút '+label);
    target.click();
  },text);

async function checkChat(page,role,questions){
 await page.waitForSelector('.discovery-assistant button[aria-label="Mở Trợ lý khám phá Đà Nẵng"]',{visible:true,timeout:15000});
 await page.click('.discovery-assistant button[aria-label="Mở Trợ lý khám phá Đà Nẵng"]');
 await page.waitForSelector('#danang-assistant-panel[data-assistant-audience="'+role+'"]');
 for(const [question,expected] of questions){
  const before=await page.$$eval('[data-chat-role="assistant"]',els=>els.length);
  await page.type('textarea[aria-label="Nhập câu hỏi"]',question);
  await page.click('button[aria-label="Gửi câu hỏi"]');
  await page.waitForFunction(n=>document.querySelectorAll('[data-chat-role="assistant"]').length>n,{timeout:15000},before);
  const answer=await page.$$eval('[data-chat-role="assistant"]',els=>els.at(-1).querySelector('p').textContent);
  assert.ok(answer.includes(expected),role+' failed '+question+': '+answer);
 }
 await page.screenshot({path:'teacher-plan-qa/chat-'+role+'-'+(await page.viewport()).width+'.png'});
 await page.click('[aria-label="Thu gọn Trợ lý Khám phá"]');
}
try{
  for(const [device,width,height] of [['desktop',1366,900],['iphone',390,844],['android',412,915],['ipad',820,1180]]){
    const page=await browser.newPage();
    const pageErrors=[],serverWrites=[],apiReads=[],thirdPartyBlocked=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await page.setCacheEnabled(false);
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request',request=>{
      const method=request.method();
      if(['POST','PUT','PATCH','DELETE'].includes(method)){
        const target=new URL(request.url());
        if(target.origin===new URL(url).origin||/firestore\.googleapis\.com$/.test(target.hostname))serverWrites.push(method+' '+target.pathname);
        else thirdPartyBlocked.push(method+' '+target.host+target.pathname);
        request.abort('blockedbyclient');
      }else {if(new URL(request.url()).origin===new URL(url).origin&&new URL(request.url()).pathname.startsWith('/api/'))apiReads.push(method+' '+new URL(request.url()).pathname);request.continue();}
    });
    await page.setViewport({width,height,deviceScaleFactor:1,isMobile:width<800,hasTouch:width<800});
    const response=await page.goto(url+'?experience=1&qa-teacher-integration=20261114',{waitUntil:'domcontentloaded',timeout:60000});
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
    if(width<1024){
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

    await checkChat(page,'teacher',[['Gợi ý 3 câu hỏi cho học sinh lớp 2 tìm hiểu Hội An','Gợi ý 3 câu hỏi'],['Thiết kế hoạt động 5 phút về bảo vệ san hô cho lớp 2','phút'],['Vòng tuần hoàn nước là gì?','bốc hơi']]);
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
    assert.deepEqual(serverWrites,[], 'Experience must not attempt ANY network mutation');
    assert.ok(!apiReads.some(s=>/\/api\/(admin|teacher|student)\//.test(s)),'No protected reads in experience');
    await page.screenshot({path:'teacher-plan-qa/'+device+'.png',fullPage:false});
    // Both import types must preview without replacing the current plan.
    for(const path of [excelFixture,wordFixture]){
      const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('cham-teacher-integration-drafts-v2:teacher-demo'))['2026-2027|2'].records.length);
      const input=await page.$('input[type="file"][accept=".docx,.xlsx"]');assert.ok(input);await input.uploadFile(path);
      await page.waitForFunction(()=>document.body.textContent.includes('Xem trước dữ liệu nhập:'),{timeout:15000});
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cham-teacher-integration-drafts-v2:teacher-demo'))['2026-2027|2'].records.length),before,'Preview must not replace a saved draft');
      await clickButton(page,'Hủy nhập');
    }
    const downloads=resolve('teacher-plan-qa/downloads-'+device);mkdirSync(downloads,{recursive:true});
    const client=await page.target().createCDPSession();await client.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
    await clickButton(page,'Tải Excel');await waitDownload(downloads,'.xlsx');
    await clickButton(page,'Tải Word');await waitDownload(downloads,'.docx');

    // Same "Lớp của tôi · Mã QR" navigation as an authenticated Teacher.
    if(width<1024)await page.click('button[aria-controls="teacher-navigation"]');
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
    await clickButton(page,'Tải thẻ PNG riêng');await waitDownload(downloads,'.png');
    await clickButton(page,'Tải trọn bộ thẻ QR (ZIP)');await waitDownload(downloads,'.zip');
    await page.pdf({path:downloads+'/the-qr-trai-nghiem.pdf',format:'A4',printBackground:true});
    assert.deepEqual(pageErrors,[],'QR classroom page errors');

    // The same workspace creates a local class; never use a real student's details.
    await page.type('input[aria-label="Tên lớp mới"]','2/99');
    await clickButton(page,'Tạo lớp');
    await page.type('textarea[aria-label="Danh sách tên học sinh"]','Học viên kiểm thử A\nHọc viên kiểm thử B');
    await clickButton(page,'Thêm vào lớp');
    assert.ok(await page.evaluate(()=>[...document.querySelectorAll('input')].some(i=>i.value==='Học viên kiểm thử A')));
    await page.evaluate(()=>{const group=document.querySelector('[aria-label="Chuyển đổi vai trò trải nghiệm"]');[...group.querySelectorAll('button')].find(b=>b.textContent==='Quản trị').click();});
    await page.waitForSelector('.admin-workspace');
    await checkChat(page,'admin',[['Tổng quan hiệu quả sử dụng hiện có những số liệu nào?','267'],['Xem kết quả học tập từng lớp ở đâu?','Kết quả theo lớp'],['Làm sao kiểm định chatbot của 25 trạm?','Kiểm định chatbot']]);
        // Navigate the actual visible sidebar by labels, expanding its parent groups.
    const groups=[['Dạy và học',['Nhật ký triển khai','Kết quả theo lớp']],['Học liệu',['Quản lý 25 trạm','Địa chỉ GDĐP']],['Báo cáo',['Hiệu quả sử dụng','Đánh giá sao và góp ý']],['Cài đặt',['Tài khoản và quyền','Giao diện','Kiểm định chatbot']]];
    for(const [group,labels] of groups){
      if(width<1024)await page.click('button[aria-controls="admin-experience-navigation"]');
      await page.evaluate(label=>{const nav=document.querySelector('#admin-experience-navigation');const b=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()===label);if(!b)throw Error('Missing group '+label);b.click();},group);
      for(const label of labels){
        if(width<1024){const expanded=await page.$eval('button[aria-controls="admin-experience-navigation"]',b=>b.getAttribute('aria-expanded'));if(expanded!=='true')await page.click('button[aria-controls="admin-experience-navigation"]');}
        await page.evaluate(label=>{const nav=document.querySelector('#admin-experience-navigation');const b=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()===label);if(!b)throw Error('Missing page '+label);b.click();},label);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+8),false,'Admin overflow '+device+' '+label);
      }
    }
    await clickButton(page,'Kiểm tra');
    await page.screenshot({path:'teacher-plan-qa/admin-'+device+'.png',fullPage:false});
    assert.deepEqual(serverWrites,[],'No network mutations in class creation and all Admin experience pages');
    assert.deepEqual(pageErrors,[],'No runtime errors after all experience menus');
    const audit={device,width,height,url,apiReads,networkMutations:serverWrites,thirdPartyBlocked,blockedMethods:['POST','PUT','PATCH','DELETE']};
    auditResults.push(audit);writeFileSync('teacher-plan-qa/request-audit.json',JSON.stringify(auditResults,null,2));
    console.log('REQUEST AUDIT',JSON.stringify(audit));

    // Scan a fictional QR using its public, deliberately noncredential deep-link.
    const qrPage=await browser.newPage();
    const qrWrites=[],qrErrors=[],qrThirdPartyBlocked=[],qrReads=[];
    qrPage.on('pageerror',error=>qrErrors.push(error.message));
    await qrPage.setCacheEnabled(false);
    await qrPage.setBypassServiceWorker(true);
    await qrPage.setRequestInterception(true);
    qrPage.on('request',request=>{
      if(['POST','PUT','PATCH','DELETE'].includes(request.method())){
        const target=new URL(request.url());
        if(target.origin===new URL(url).origin||/firestore\.googleapis\.com$/.test(target.hostname))qrWrites.push(request.method()+' '+target.pathname);
        else qrThirdPartyBlocked.push(request.method()+' '+target.host+target.pathname);
        request.abort('blockedbyclient');
      }else {if(new URL(request.url()).origin===new URL(url).origin&&new URL(request.url()).pathname.startsWith('/api/'))qrReads.push(request.method()+' '+new URL(request.url()).pathname);request.continue();}
    });
    await qrPage.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1});
    await qrPage.goto(url.split('?')[0]+'#demo-student=g2&n=1&c=2%2F24',{waitUntil:'domcontentloaded',timeout:60000});
    await qrPage.waitForFunction(()=>document.body.textContent?.includes('Thẻ QR TRẢI NGHIỆM'),{timeout:20000});
    await qrPage.evaluate(()=>{
      const btn=[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='CHẠM ĐỂ KHÁM PHÁ');
      if(!btn)throw Error('Missing cover entry for demo QR');btn.click();
    });
    await qrPage.waitForFunction(()=>document.body.textContent?.includes('Học sinh 01')&&document.body.textContent?.includes('Khối 2'),{timeout:30000});
    await checkChat(qrPage,'student',[['Phố cổ Hội An có gì đặc biệt?','Hội An'],['San hô là động vật hay thực vật?','động vật'],['Vòng tuần hoàn nước là gì?','bốc hơi']]);
    assert.deepEqual(qrWrites,[],'Demo QR must never attempt a network mutation');
    assert.deepEqual(qrErrors,[],'Demo QR guest errors');
    await qrPage.screenshot({path:'teacher-plan-qa/qr-entry-'+device+'.png',fullPage:false});
    Object.assign(audit,{qrApiReads:qrReads,qrNetworkMutations:qrWrites,qrThirdPartyBlocked});writeFileSync('teacher-plan-qa/request-audit.json',JSON.stringify(auditResults,null,2));
    await qrPage.close();
    console.log('Teacher integration QA',device,'PASS: unified menu, verified integration, ZIP/PNG QR, local-only QR scan, no backend writes');
    await page.close();
  }
} finally {await browser.close();}
