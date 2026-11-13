export type FreeExplorer = {id:string;name:string;role:'student'|'teacher'};
let active:FreeExplorer|null=null;
export const freeExplorerIdentity={
 current:()=>active,
 activate:(person:FreeExplorer|null)=>{active=person},
 savedName(role:'student'|'teacher'){try{return JSON.parse(localStorage.getItem('cham_free_'+role)||'null')?.name||''}catch{return ''}},
 save(name:string,role:'student'|'teacher'){
  name=name.trim().replace(/\s+/g,' ');if(!name||name.length>60)throw Error('Vui lòng nhập tên từ 1 đến 60 ký tự.');
  let prior;try{prior=JSON.parse(localStorage.getItem('cham_free_'+role)||'null')}catch{}
  const id=prior?.name===name&&/^[a-f0-9]{32}$/.test(prior?.id)?prior.id:Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
  active={id,name,role};try{localStorage.setItem('cham_free_'+role,JSON.stringify(active))}catch{}return active;
 }
};
