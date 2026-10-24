import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {ALL_25_STATIONS} from '../src/data/allStations';
const publicRoot=path.resolve('public');
const output=path.join(publicRoot,'images/learning-thumbnails');
await mkdir(output,{recursive:true});
const sources=new Set(ALL_25_STATIONS.flatMap(station=>[station.coverImage,...station.hotspots.map(point=>point.image)]));
const manifest:Record<string,string>={};
let original=0,compressed=0;
for(const source of sources){
 if(!source?.startsWith('/')||source.startsWith('//'))continue;
 const file=path.resolve(publicRoot,decodeURIComponent(source.slice(1).split('?')[0]));
 if(!file.startsWith(publicRoot+path.sep))continue;
 try{
  const bytes=await readFile(file);
  const meta=await sharp(bytes).metadata();
  if(bytes.length<40000||!meta.width||meta.width<=480)continue;
  const hash=createHash('sha256').update(bytes).digest('hex').slice(0,16);
  const name=hash+'.webp';
  await sharp(bytes).resize({width:480,withoutEnlargement:true}).webp({quality:72,effort:5}).toFile(path.join(output,name));
  manifest[source]='/images/learning-thumbnails/'+name;
  original+=bytes.length;compressed+=(await stat(path.join(output,name))).size;
 }catch(error){throw new Error(`Cannot generate thumbnail for ${source}`,{cause:error});}
}
await writeFile('src/data/learningThumbnails.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({images:Object.keys(manifest).length,originalBytes:original,thumbnailBytes:compressed}));
