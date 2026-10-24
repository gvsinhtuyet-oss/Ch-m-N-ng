import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
await fs.mkdir('qa-results',{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];let stations;let activePage;
try {
for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
 const context=await browser.newContext({viewport});
 await context.addInitScript(()=>{window.__qaOscillations=0;const Audio=window.AudioContext;if(Audio)window.AudioContext=class extends Audio{createOscillator(){window.__qaOscillations++;return super.createOscillator();}};});
 const page=await context.newPage();activePage=page;const errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE_ERROR',e.message)});
 await page.goto('http://127.0.0.1:3000/qa/media.html');
 await page.locator('#qa-stations').waitFor({state:'attached'});
 stations=JSON.parse(await page.locator('#qa-stations').textContent());
 for(const station of stations){
  await page.goto('http://127.0.0.1:3000/qa/media.html?station='+station.id);
  await page.locator('#qa-stations').waitFor({state:'attached'});
  const coverResponse=await page.request.get('http://127.0.0.1:3000'+station.cover);assert.equal(coverResponse.status(),200);
  for(let i=0;i<station.points.length;i++){
   const point=station.points[i];
   const label=point.title.replace(/^\d+\.\s*/, '');
   const tile=page.getByRole('button').filter({hasText:point.title});
   if(await tile.count())await tile.last().click();
   else await page.getByRole('button').filter({hasText:label}).last().click();
   const image=page.locator('img').filter({hasNot:page.locator('nothing')});
   const primary=page.locator('img[alt='+JSON.stringify(point.title)+']').first();
   await primary.waitFor({state:'visible'});
   await primary.evaluate(img=>img.decode());
   assert.equal(await primary.getAttribute('src'),point.image,station.id+' '+point.id+' fallback');
   assert.equal(await primary.evaluate(img=>getComputedStyle(img).objectFit),'contain');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
   assert.equal(overflow,false,station.id+' '+point.id+' horizontal overflow');
   const clipped=await page.locator('.stage-one-map-content').evaluate(el=>[el,...el.querySelectorAll('div,aside,section')].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX!=='auto').map(e=>({tag:e.tagName,width:e.clientWidth,scroll:e.scrollWidth})));assert.deepEqual(clipped,[],station.id+' '+point.id+' clipped content');
   if(i===0||station.id==='g5-ky-anh-me-nhu'||station.id==='g5-lua-ma-chau')await page.screenshot({path:`qa-results/${viewport.width}-${station.id}-${i+1}.png`,fullPage:true});
   if(point.gallery.length>1){
    await page.getByRole('button',{name:'Phóng to hình ảnh',exact:true}).click();
    const gallery=page.locator('[aria-label="Ảnh khám phá thêm"] img');
    assert.equal(await gallery.count(),point.gallery.length-1);
    for(const img of await gallery.all())await img.evaluate(i=>i.decode());
    await page.screenshot({path:`qa-results/${viewport.width}-${station.id}-${i+1}-gallery.png`,fullPage:true});
    await page.getByRole('button',{name:'Đóng ảnh lớn',exact:true}).click();
   }
   const soundBefore=await page.evaluate(()=>window.__qaOscillations);
   if(i===0&&point.wrong){
    const wrong=page.getByRole('button',{name:point.wrong,exact:true});
    await wrong.click();const check=page.getByRole('button',{name:'KIỂM TRA',exact:true});if(await check.count())await check.click();
    await page.getByText(/Chưa đúng/).first().waitFor({state:'visible'});
    await wrong.waitFor({state:'visible'});await page.waitForFunction(el=>!el.disabled,await wrong.elementHandle());
   }
   if(point.answer){
    const option=page.getByRole('button',{name:point.answer,exact:true});
    if(await option.isEnabled()){
     await option.click();
     const check=page.getByRole('button',{name:'KIỂM TRA',exact:true});if(await check.count())await check.click();
     await page.getByText(/Chính xác!/).first().waitFor({state:'visible'});
    }
   }
   await page.waitForFunction(before=>window.__qaOscillations>before,soundBefore);
   results.push({viewport,station:station.id,point:point.id,image:point.image,pass:true});
  }
 }
 assert.deepEqual(errors,[]);
 await context.close();
}
await fs.writeFile('qa-results/results.json',JSON.stringify({stations:stations.length,pointChecks:results.length,results},null,2));
await browser.close();console.log('BROWSER_QA_PASS',stations.length,'stations',results.length,'point/viewport checks');

} catch(error){if(activePage&&!activePage.isClosed()){await activePage.screenshot({path:"qa-results/failure.png",fullPage:true});await fs.writeFile("qa-results/failure.html",await activePage.content());}await browser.close();throw error;}
