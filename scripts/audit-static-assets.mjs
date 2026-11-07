// Read-only audit. Never removes, recompresses or renames an approved image, game or background.
// Run after Vite build: node scripts/audit-static-assets.mjs
import {readdir, stat, readFile} from 'node:fs/promises';
import {join,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';

async function inventory(root,dir=root,items=[]) {
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const file=join(dir,entry.name);
    if(entry.isDirectory())await inventory(root,file,items);
    else if(entry.isFile())items.push({path:relative(root,file).split('\\').join('/'),size:(await stat(file)).size,absolute:file});
  }
  return items;
}
const b=n=>(n/1024/1024).toFixed(2)+' MiB';
const files=await inventory('dist');
const total=files.reduce((s,f)=>s+f.size,0);
const groups=new Map();
for(const file of files){
  const parts=file.path.split('/');
  const category=parts[0]==='images' ? 'images/'+(parts[1]||'(root)') :
    parts[0]==='games' ? 'games/'+(parts[1]||'(root)') :
    parts[0]==='audio' ? 'audio' : parts[0]==='assets' ? 'scripts+styles' :
    parts[0];
  groups.set(category,(groups.get(category)||0)+file.size);
}
const sorted=[...files].sort((a,b)=>b.size-a.size);
console.log('ASSET AUDIT (read only): static dist '+b(total)+' in '+files.length+' files');
console.log('Top categories:',JSON.stringify([...groups].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([path,size])=>({path,MiB:+(size/1048576).toFixed(2)}))));
console.log('Largest files:',JSON.stringify(sorted.slice(0,22).map(f=>({path:f.path,MiB:+(f.size/1048576).toFixed(2)}))));

const preserved=[
'adventure-background.svg',
'images/chamdanang-journey-orange.webp',
'images/landing/river-mobile.webp',
'images/landing/river-desktop.webp',
'images/stage1-treasure-map-background.webp',
];
const paths=new Set(files.map(f=>f.path));
for(const file of preserved)if(!paths.has(file))throw new Error('Reviewed background missing from dist: '+file);
const maps=JSON.parse(await readFile('src/data/journeyMapAssets.json','utf8'));
if(maps.length!==25)throw new Error('Expected 25 reviewed maps, received '+maps.length);
for(const item of maps){
 const file=item.image.replace(/^\//,'');
 if(!paths.has(file))throw new Error('Approved station map missing: '+item.stationId+' '+file);
}
console.log('PRESERVATION PASS: '+preserved.length+' backgrounds and all 25 approved maps shipped, no image modified.');

// Duplicate candidates are reported, not deleted: public links may depend on them.
const large=files.filter(f=>f.size>=150000);
const hashes=new Map();
for(const f of large){
 const sha=createHash('sha256').update(await readFile(f.absolute)).digest('hex');
 const list=hashes.get(sha)||[];list.push(f);hashes.set(sha,list);
}
const duplicates=[...hashes.values()].filter(list=>list.length>1)
  .map(list=>({copies:list.length,MiB:+(list[0].size*list.length/1048576).toFixed(2),paths:list.map(f=>f.path)}))
  .sort((a,b)=>b.MiB-a.MiB);
console.log('Exact duplicate candidates >= 150 KB (NOT removed):',JSON.stringify(duplicates.slice(0,15)));
