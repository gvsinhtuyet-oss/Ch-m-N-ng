// Stage only runtime inputs. Never prune the working tree or copy live content-data/.env.
import {readFile,writeFile,mkdir,cp,rm,lstat,readdir} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function packageProduction(root=process.cwd()) {
 root=resolve(root);
 const out=resolve(root,'.production-build');
 try {await lstat(out); await readFile(resolve(out,'.cham-generated'));}
 catch(e) {if(e.code!=='ENOENT')throw e; if(await lstat(out).catch(()=>null))throw new Error('Refusing to overwrite an unmarked directory');}
 await rm(out,{recursive:true,force:true}); await mkdir(out);
 await writeFile(resolve(out,'.cham-generated'),'Generated runtime package; contains no application data.\n');
 const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
 const lock=JSON.parse(await readFile(resolve(root,'package-lock.json'),'utf8'));
 await writeFile(resolve(out,'package.json'),JSON.stringify({name:pkg.name,private:true,type:'module',scripts:{start:'node content-server.mjs'},dependencies:pkg.dependencies},null,2)+'\n');
 const modules=new Set();
 async function copyModule(file) {
  if(modules.has(file))return; modules.add(file);
  if(!/^[a-zA-Z0-9_-]+\.mjs$/.test(file))throw new Error('Unexpected backend module path: '+file);
  const source=await readFile(resolve(root,file),'utf8');
  await cp(resolve(root,file),resolve(out,file));
  for(const match of source.matchAll(/(?:from\s+|import\s*\(\s*)['"]\.\/([^'"]+\.mjs)['"]/g))await copyModule(match[1]);
 }
 await copyModule('content-server.mjs');
 await cp(resolve(root,'dist'),resolve(out,'dist'),{recursive:true});
 const dependencies=[];
 for(const [file,meta] of Object.entries(lock.packages||{})) {
  if(!file || meta.dev || meta.devOptional)continue;
  if(!file.startsWith('node_modules/') || file.split('/').includes('..') || meta.link)throw new Error('Unsafe package path');
  const source=resolve(root,file);
  try {await lstat(source);} catch(e) {if(e.code==='ENOENT'&&meta.optional)continue;throw e;}
  await mkdir(dirname(resolve(out,file)),{recursive:true});
  await cp(source,resolve(out,file),{recursive:true,filter:p=>p===source || !relative(source,p).split('/').includes('node_modules')});
  dependencies.push(file);
 }
 async function bytes(dir) {let total=0; for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())total+=await bytes(p);else if(e.isFile())total+=(await lstat(p)).size;else throw new Error('Unexpected symbolic link in runtime package: '+p);}return total;}
 const sizes={dist:await bytes(resolve(out,'dist')),node_modules:await bytes(resolve(out,'node_modules')),total:await bytes(out)};
 // Leave headroom below the publishing limit. Container base layers are not counted here.
 if(sizes.total>200_000_000)throw new Error('Runtime package exceeds 200 MB safety budget: '+sizes.total);
 const manifest={sizes,backendModules:[...modules].sort(),dependencies:dependencies.sort(),excluded:['source files','devDependencies','public duplicate','content-data','.env','.git','npm cache']};
 await writeFile(resolve(out,'runtime-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify(manifest,null,2)); return out;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await packageProduction();
