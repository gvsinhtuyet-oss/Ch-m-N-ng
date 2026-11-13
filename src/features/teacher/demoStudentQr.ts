/** Noncredential, fictional QR deep links used only by Teacher Experience. */
export type DemoStudentLink = {grade:number;ordinal:number;className:string};
const supported = /^[1-5]\/[1-9]\d{0,2}$/;
export function makeDemoStudentQrUrl(origin:string,grade:number,ordinal:number,classLabel:string):string {
  const className=classLabel.replace(/\s*\(trải nghiệm\)\s*$/i,'').trim();
  if(!Number.isInteger(grade)||grade<1||grade>5||
     !Number.isInteger(ordinal)||ordinal<1||ordinal>100||
     !supported.test(className)||Number(className[0])!==grade)
    throw new Error('Tên lớp dùng cho QR trải nghiệm phải có dạng 2/24 và đúng khối.');
  const u=new URL(origin);
  if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw new Error('Chỉ tạo QR cho website HTTPS.');
  u.pathname='/';u.search='';u.hash='demo-student=g'+grade+'&n='+ordinal+'&c='+encodeURIComponent(className);
  return u.toString();
}
export function parseDemoStudentQr(hash:string):DemoStudentLink|null{
  if(typeof hash!=='string'||hash.length>160||!hash.startsWith('#demo-student='))return null;
  const params=new URLSearchParams(hash.slice(1));
  if([...params.keys()].sort().join(',')!=='c,demo-student,n')return null;
  const g=params.get('demo-student')||'';
  const n=params.get('n')||'';
  const className=params.get('c')||'';
  if(!/^g[1-5]$/.test(g)||!/^(?:[1-9]|[1-9]\d|100)$/.test(n)||!supported.test(className))return null;
  const grade=Number(g.slice(1)),ordinal=Number(n);
  if(Number(className[0])!==grade)return null;
  return {grade,ordinal,className};
}
