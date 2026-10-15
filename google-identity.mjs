import {verify, randomBytes, createHash} from 'node:crypto';
export const googleClientId=process.env.GOOGLE_CLIENT_ID || '378356637128-25v3f07nagrpsgte6suujhme3c3d31bc.apps.googleusercontent.com';
let certs={},expires=0;
export async function verifyGoogleCredential(token,nonce){
 try{
  if(typeof token!=='string'||token.length>16000)throw Error();
  const parts=token.split('.');if(parts.length!==3)throw Error();
  const head=JSON.parse(Buffer.from(parts[0],'base64url')),p=JSON.parse(Buffer.from(parts[1],'base64url'));
  if(head.alg!=='RS256'||!head.kid)throw Error();
  if(Date.now()>expires){const r=await fetch('https://www.googleapis.com/oauth2/v1/certs',{signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error();certs=await r.json();expires=Date.now()+3600000;}
  if(!certs[head.kid]||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),certs[head.kid],Buffer.from(parts[2],'base64url')))throw Error();
  const now=Date.now()/1000;
  if(!['https://accounts.google.com','accounts.google.com'].includes(p.iss)||p.aud!==googleClientId||!Number.isFinite(p.exp)||p.exp<=now||!Number.isFinite(p.iat)||p.iat>now+60||!p.sub||p.email_verified!==true||p.nonce!==nonce)throw Error();
  return p;
 }catch{throw Object.assign(new Error('Không xác minh được đăng nhập Google. Hãy thử lại.'),{status:401});}
}
export function newGoogleChallenge(){const nonce=randomBytes(24).toString('hex');return {nonce,id:createHash('sha256').update(nonce).digest('hex')};}
