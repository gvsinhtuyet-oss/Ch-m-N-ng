// Extract exactly the five approved V12 images at build time.
// The legacy HTML remains untouched and available for rollback; no re-encoding.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=join(root,'public/games/grade3-my-khe-ban-than/v12/index.html');
const output=join(root,'public/games/shared/v1/grade3/my-khe');
const html=readFileSync(source,'utf8');
const list=[...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)];
if(list.length!==5)throw new Error('V12 artwork source changed: expected 2 backgrounds and 3 option photos, got '+list.length);
const names=['play.webp','victory.webp','choice-0.webp','choice-1.webp','choice-2.webp'];
mkdirSync(output,{recursive:true});
for(let i=0;i<list.length;i++){
  const data=Buffer.from(list[i][1],'base64');
  if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP'||data.byteLength<5000){
    throw new Error('Invalid approved V12 WebP asset: '+names[i]);
  }
  const path=join(output,names[i]);
  if(!existsSync(path)||!readFileSync(path).equals(data))writeFileSync(path,data);
}
console.log('Preserved 5 original approved Mỹ Khê – Bàn Than WebP assets from V12 without recompression.');
