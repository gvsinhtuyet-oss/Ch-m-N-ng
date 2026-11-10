/**
 * Private teacher-side exports of already-issued student QR cards.
 * Never uploads QR credentials, writes them to the repository, or reissues codes.
 */
export interface PrintableStudentCard {
  id: string;
  name: string;
  code: string;
  qr: string;
}

const safePart = (input: string) => input.normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/đ/g,'d').replace(/Đ/g,'D')
  .replace(/[^a-zA-Z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'')
  .slice(0,64) || 'hoc-sinh';

function drawCenteredText(
  context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, font: string,
) {
  context.font=font;
  context.textAlign='center';
  context.fillText(text,x,y,maxWidth);
}

async function renderCard(card:PrintableStudentCard,className:string):Promise<Blob> {
  if(!card.qr)throw new Error('Thẻ của một học sinh chưa tạo được QR. Vui lòng kiểm tra thẻ trước khi tải.');
  const canvas=document.createElement('canvas');
  canvas.width=900;canvas.height=1060;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Trình duyệt chưa hỗ trợ xuất ảnh thẻ học sinh.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,900,1060);
  ctx.strokeStyle='#bae6fd';ctx.lineWidth=7;ctx.strokeRect(10,10,880,1040);
  ctx.fillStyle='#0c4a6e';
  drawCenteredText(ctx,'CHẠM ĐÀ NẴNG',450,116,770,'bold 52px Arial, sans-serif');
  ctx.fillStyle='#334155';
  drawCenteredText(ctx,'THẺ VÀO HỌC · LỚP '+className,450,174,790,'bold 30px Arial, sans-serif');
  ctx.fillStyle='#0f172a';
  drawCenteredText(ctx,card.name,450,255,810,'bold 48px Arial, sans-serif');
  const qr=new Image();
  qr.src=card.qr;
  await new Promise<void>((resolve,reject)=>{
    if(qr.complete&&qr.naturalWidth>0){resolve();return;}
    qr.onload=()=>resolve();
    qr.onerror=()=>reject(new Error('Không đọc được ảnh QR của học sinh.'));
  });
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(qr,222,300,456,456);
  ctx.imageSmoothingEnabled=true;
  ctx.fillStyle='#0f172a';
  drawCenteredText(ctx,card.code,450,824,800,'bold 44px monospace');
  ctx.fillStyle='#475569';
  drawCenteredText(ctx,'Quét QR, xem video chào mừng,',450,891,790,'28px Arial, sans-serif');
  drawCenteredText(ctx,'rồi bấm CHẠM ĐỂ KHÁM PHÁ để vào lớp của em.',450,931,830,'26px Arial, sans-serif');
  ctx.fillStyle='#9a3412';
  drawCenteredText(ctx,'Mã riêng · Chỉ gửi thẻ này cho gia đình học sinh.',450,1001,830,'23px Arial, sans-serif');
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('Không thể xuất ảnh QR. Hãy thử lại trên máy tính.');
  return blob;
}

function downloadBlob(blob:Blob,name:string){
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=name;
  document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),10000);
}

export async function downloadStudentCardPng(card:PrintableStudentCard,className:string){
  const blob=await renderCard(card,className);
  downloadBlob(blob,`The-QR-${safePart(className)}-${safePart(card.name)}.png`);
}

export async function downloadStudentCardsZip(cards:PrintableStudentCard[],className:string){
  if(!cards.length)throw new Error('Chưa có thẻ mới để tải.');
  if(cards.some(card=>!card.qr))throw new Error('Một số thẻ chưa có ảnh QR. Kiểm tra lại trước khi tải trọn bộ.');
  const {default:JSZip}=await import('jszip');
  const archive=new JSZip();
  for(const [index,card] of cards.entries()){
    const png=await renderCard(card,className);
    archive.file(`${String(index+1).padStart(2,'0')}-${safePart(card.name)}.png`,png);
  }
  const zip=await archive.generateAsync({type:'blob',compression:'DEFLATE'});
  downloadBlob(zip,`The-QR-CHAM-DA-NANG-Lop-${safePart(className)}.zip`);
}
