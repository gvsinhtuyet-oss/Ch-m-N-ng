import React, {useEffect,useMemo,useRef,useState} from 'react';
import confetti from 'canvas-confetti';
import {audioService} from '../../services/AudioService';
import {progressService} from '../../services/ProgressService';
import type {Station} from '../../types';

type Pick={text:string; options:string[]; correct:number; hint:string; images?:string[]};
type Pair={text:string; left:string[]; right:string[]; hint:string};
type Game={title:string; subtitle:string; icon:string; reward:string; photo:string; questions:[Pick,Pick,Pick,Pair,Pick]};
const pic=(id:string)=>'/learning/grade3/photos/'+id+'.webp';
const GAMES:Record<string,Game>={
 'g3-station-2':{title:'GIẢI MÃ DẤU ẤN LỊCH SỬ',subtitle:'Hoàng Diệu – Phan Châu Trinh',icon:'🏛️',reward:'Chìa khóa thời gian',photo:pic('phan-chau-trinh'),questions:[
 {text:'Hình ảnh nào là nhà yêu nước Phan Châu Trinh?',options:['Chân dung Phan Châu Trinh','Ảnh bãi biển Mỹ Khê','Ảnh ghềnh Bàn Than'],images:[pic('phan-chau-trinh'),pic('my-khe'),pic('ban-than')],correct:0,hint:'Hãy nhớ chân dung nhà yêu nước được giới thiệu ở Chặng 1.'},
 {text:'Hoàng Diệu đã chỉ huy quân sĩ bảo vệ thành Hà Nội năm 1882. Đúng hay sai?',options:['Đúng','Sai'],correct:0,hint:'Hoàng Diệu là tấm gương yêu nước, kiên cường bảo vệ thành.'},
 {text:'Phong trào Duy Tân khuyến khích việc nào?',options:['Mở trường dạy chữ Quốc ngữ','Không cho trẻ đến trường','Chỉ học thuộc mà không tìm hiểu'],correct:0,hint:'Phong trào đề cao mở mang hiểu biết và đổi mới.'},
 {text:'Nối nhân vật hoặc hoạt động với dấu ấn phù hợp.',left:['Hoàng Diệu','Phan Châu Trinh','Phong trào Duy Tân'],right:['Chỉ huy bảo vệ thành Hà Nội','Coi trọng mở mang hiểu biết','Khuyến khích học chữ Quốc ngữ'],hint:'Nhớ những việc làm tiêu biểu trong lời dẫn Chặng 1.'},
 {text:'Khi giới thiệu một câu nói của danh nhân mà chưa rõ nguồn, em làm gì?',options:['Nhờ thầy cô kiểm tra nguồn trước','Gán ngay tên một danh nhân','Tự nghĩ thêm cho hấp dẫn'],correct:0,hint:'Kể chuyện lịch sử cần trung thực và có căn cứ.'}
 ]},
 'g3-station-3':{title:'BÍ MẬT SẮC MÀU QUÊ HƯƠNG',subtitle:'Cộng đồng các dân tộc Đà Nẵng',icon:'🎨',reward:'Huy hiệu văn hóa',photo:pic('co-tu-costumes'),questions:[
 {text:'Hình ảnh nào giới thiệu trang phục văn hóa của đồng bào Cơ Tu?',options:['Trang phục truyền thống Cơ Tu','Cảnh biển Mỹ Khê','Ghềnh đá Bàn Than'],images:[pic('co-tu-costumes'),pic('my-khe'),pic('ban-than')],correct:0,hint:'Quan sát hoa văn và trang phục trong ảnh.'},
 {text:'Tung tung – da dá là điệu múa truyền thống của đồng bào Cơ Tu. Đúng hay sai?',options:['Đúng','Sai'],correct:0,hint:'Điệu múa này được nhắc trong bài học về cộng đồng Cơ Tu.'},
 {text:'Trên đỉnh cây nêu của đồng bào Co có hình gì?',options:['Chim chèo bẻo bằng gỗ','Chiếc thuyền buồm','Con cá cơm'],correct:0,hint:'Hãy nhớ hình con chim được trang trí trên đỉnh cây nêu.'},
 {text:'Nối nét văn hóa với cộng đồng phù hợp.',left:['Đồng bào Cơ Tu','Đồng bào Co','Các cộng đồng dân tộc'],right:['Múa Tung tung – da dá','Cây nêu trang trí hình chim chèo bẻo','Cùng làm phong phú văn hóa quê hương'],hint:'Mỗi cộng đồng có nét riêng đáng trân trọng.'},
 {text:'Bạn có trang phục và tiếng nói khác mình. Em nên làm gì?',options:['Tôn trọng, lắng nghe và tìm hiểu','Trêu chọc sự khác biệt','Tự ý chạm vào đồ dùng của bạn'],correct:0,hint:'Tôn trọng sự khác biệt là cách gìn giữ tình đoàn kết.'}
 ]},
 'g3-station-4':{title:'TRUY TÌM BÍ QUYẾT NAM Ô',subtitle:'Nghề làm nước mắm Nam Ô',icon:'🏺',reward:'Bình nước mắm vàng',photo:pic('nam-o'),questions:[
 {text:'Hình nào gắn với nghề làm nước mắm Nam Ô?',options:['Hình ảnh làng nghề Nam Ô','Trang phục Cơ Tu','Bãi biển Mỹ Khê'],images:[pic('nam-o'),pic('co-tu-costumes'),pic('my-khe')],correct:0,hint:'Hãy chọn hình gắn với nghề nước mắm ven biển.'},
 {text:'Cá cơm than và muối là nguyên liệu chính làm nước mắm Nam Ô. Đúng hay sai?',options:['Đúng','Sai'],correct:0,hint:'Đây là hai nguyên liệu chính được giới thiệu trong bài.'},
 {text:'Nghề làm nước mắm Nam Ô được ghi danh di sản văn hóa phi vật thể quốc gia vào năm nào?',options:['2019','1882','1904'],correct:0,hint:'Mốc năm được giới thiệu ở điểm khám phá đầu tiên.'},
 {text:'Nối nguyên liệu hoặc dụng cụ với công dụng.',left:['Cá cơm than','Muối biển','Thùng hoặc chum ủ'],right:['Nguyên liệu cá để làm mắm','Dùng để ướp cá','Chứa hỗn hợp trong quá trình ủ'],hint:'Nhớ lại cách người thợ làm nên giọt mắm.'},
 {text:'Khi đến thăm cơ sở làm nước mắm, em nên làm gì?',options:['Quan sát, nghe hướng dẫn, không tự mở chum ủ','Tự mở chum để xem','Chạy nhảy giữa khu vực sản xuất'],correct:0,hint:'Tôn trọng công sức người làm nghề và giữ an toàn.'}
 ]},
 'g3-station-5':{title:'XƯỞNG THUYỀN THÚNG TÍ HON',subtitle:'Nghề đan thuyền thúng ở Sơn Trà',icon:'🛶',reward:'Huy hiệu nghệ nhân nhí',photo:pic('tho-quang-day'),questions:[
 {text:'Hình ảnh nào gắn với nghề làm thuyền thúng?',options:['Nghề thuyền thúng ở Thọ Quang','Nghề nước mắm Nam Ô','Trang phục Cơ Tu'],images:[pic('tho-quang-day'),pic('nam-o'),pic('co-tu-costumes')],correct:0,hint:'Thuyền thúng có thân gần tròn, được đan từ tre.'},
 {text:'Tre là nguyên liệu chính để đan thân thuyền thúng. Đúng hay sai?',options:['Đúng','Sai'],correct:0,hint:'Người thợ chẻ, vót và đan các nan tre.'},
 {text:'Người thợ đan các nan tre để tạo thành bộ phận nào?',options:['Thân thúng tròn','Tấm lụa','Chum đựng nước mắm'],correct:0,hint:'Các nan tre được đan để tạo hình chiếc thúng.'},
 {text:'Nối công đoạn với việc làm phù hợp.',left:['Chẻ và vót tre','Đan nan tre','Chống thấm'],right:['Tạo nan tre','Tạo thân thúng','Giúp thúng hạn chế thấm nước'],hint:'Hãy nhớ thứ tự tạo nên chiếc thuyền thúng.'},
 {text:'Khi xem người thợ chẻ tre bằng dao sắc, em nên làm gì?',options:['Đứng quan sát cùng người lớn, không chạm dao','Tự cầm dao thử','Đùa nghịch cạnh người thợ'],correct:0,hint:'Dụng cụ sắc có thể gây nguy hiểm.'}
 ]}
};
const shuffle=<T,>(xs:T[]):T[]=>{const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
type Props={station:Station;studentId:string;isReadOnly:boolean;onCompleteStage:()=>void};
export const Grade3V12StyleGame:React.FC<Props>=({station,studentId,isReadOnly,onCompleteStage})=>{
 const game=GAMES[station.id];
 const [phase,setPhase]=useState<'intro'|'play'|'retry'|'victory'>('intro');
 const [idx,setIdx]=useState(0);const [wrongIds,setWrongIds]=useState<number[]>([]);
 const [locked,setLocked]=useState(false);const [feedback,setFeedback]=useState('');
 const [selectedLeft,setSelectedLeft]=useState<number|null>(null);
 const [matches,setMatches]=useState<Record<number,number>>({});
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const queue=phase==='retry'?wrongIds:[0,1,2,3,4];
 const questionIndex=queue[idx]??0;const question=game.questions[questionIndex];
 const options=useMemo(()=>game.questions.map(q=>'options'in q?shuffle(q.options.map((label,i)=>({label,i}))):[]),[game]);
 const rightOrder=useMemo(()=>shuffle([0,1,2]),[questionIndex,phase]);
 const reset=()=>{audioService.playSfx('click');setIdx(0);setWrongIds([]);setMatches({});setSelectedLeft(null);setLocked(false);setFeedback('');setPhase('intro');};
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(phase!=='victory')return;const id=setInterval(()=>confetti({particleCount:65,spread:85,origin:{y:.55}}),1600);confetti({particleCount:120,spread:100});return()=>clearInterval(id);},[phase]);
 const advance=()=>{setFeedback('');setLocked(false);setMatches({});setSelectedLeft(null);if(idx<queue.length-1){setIdx(i=>i+1);}else if(phase==='play'&&wrongIds.length){setIdx(0);setPhase('retry');}else{setPhase('victory');audioService.playSfx('reward');}};
 const answer=(correct:boolean,hint:string)=>{if(locked)return;audioService.playSfx('click');setLocked(true);if(correct){audioService.playSfx('correct');setFeedback('Chính xác! Em giỏi lắm!');timer.current=setTimeout(advance,1000);}else{audioService.playSfx('wrong');setFeedback('Chưa đúng! 💡 '+hint);if(phase==='play')setWrongIds(old=>old.includes(questionIndex)?old:[...old,questionIndex]);timer.current=setTimeout(()=>{setLocked(false);setFeedback('');setMatches({});setSelectedLeft(null);},2200);}};
 const pair=question as Pair;const isPair=questionIndex===3;
 const onRight=(right:number)=>{if(locked||selectedLeft===null)return;audioService.playSfx('click');setMatches(m=>({...m,[selectedLeft]:right}));setSelectedLeft(null);};
 const finish=()=>{audioService.playSfx('click');if(!isReadOnly){const reward=station.rewards.find(r=>r.stage===2)||station.rewards[1];progressService.completeStage2(studentId,station.id,reward?.id);}onCompleteStage();};
 const bg={backgroundImage:`linear-gradient(120deg,rgba(3,20,43,.92),rgba(5,65,83,.78)),url("${game.photo}")`,backgroundSize:'cover',backgroundPosition:'center'} as React.CSSProperties;
 return <section id="grade3-v12-game" className="relative min-h-[78dvh] overflow-hidden rounded-3xl p-3 text-white sm:p-6" style={bg}>
 <div className="mx-auto max-w-5xl"><header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/30 bg-black/35 p-3 backdrop-blur-md"><div><div className="text-xs font-bold uppercase tracking-widest text-amber-200">Chặng 2 · Khối 3</div><h2 className="text-xl font-black sm:text-3xl">{game.icon} {game.title}</h2><p className="text-sm text-white/85">{game.subtitle}</p></div><button onClick={()=>{audioService.playSfx('click');document.fullscreenElement?document.exitFullscreen():document.querySelector('#grade3-v12-game')?.requestFullscreen?.();}} className="rounded-xl border border-white/40 px-4 py-2 font-bold">⛶ Toàn màn hình</button></header>
 {phase==='intro'?<div className="mx-auto my-12 max-w-2xl rounded-3xl border-4 border-amber-300 bg-slate-950/80 p-7 text-center shadow-2xl"><div className="text-7xl">{game.icon}</div><h3 className="mt-4 text-3xl font-black text-amber-200">SẴN SÀNG KHÁM PHÁ?</h3><p className="my-5 text-lg">5 thử thách · 3 mức độ · Âm thanh · Truy lại dấu vết · Kho báu chiến thắng</p><button className="min-h-16 rounded-2xl bg-amber-400 px-10 text-xl font-black text-slate-900" onClick={()=>{audioService.playSfx('click');setPhase('play');}}>BẮT ĐẦU KHÁM PHÁ →</button></div>:
 phase==='victory'?<div className="mx-auto my-10 max-w-2xl rounded-3xl border-4 border-amber-300 bg-slate-950/85 p-8 text-center"><div className="text-7xl">🏆🎉💎</div><h3 className="mt-5 text-2xl font-black text-amber-200 sm:text-4xl">CHÚC MỪNG HOÀN THÀNH THỬ THÁCH</h3><p className="mt-5 text-2xl font-black">🌟 THẬT TUYỆT VỜI!</p><p className="mt-3">Em đã chinh phục 5 thử thách!</p><p className="mt-3 text-xl font-bold text-amber-200">💎 {game.reward} đã thuộc về em!</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={reset} className="min-h-14 rounded-xl border-2 border-white px-6 font-black">↻ CHƠI LẠI</button><button onClick={finish} className="min-h-14 rounded-xl bg-amber-400 px-6 font-black text-slate-950">➜ TIẾP TỤC HÀNH TRÌNH</button></div></div>:
 <div className="rounded-3xl border-4 border-amber-300 bg-slate-950/85 p-4 shadow-2xl sm:p-7"><div className="mb-4 flex justify-between gap-2 text-sm font-black text-amber-200"><span>{phase==='retry'?'🔎 TRUY LẠI DẤU VẾT':questionIndex<2?'⭐ NHẬN BIẾT':questionIndex<4?'🌟 THÔNG HIỂU':'💎 VẬN DỤNG'}</span><span>Câu {idx+1}/{queue.length}</span></div><div className="mb-5 flex gap-2">{queue.map((v,i)=><div key={v} className={'h-2 flex-1 rounded-full '+(i<=idx?'bg-amber-300':'bg-white/25')}/>)}</div><h3 className="mb-6 text-xl font-black leading-relaxed sm:text-3xl">{question.text}</h3>
 {!isPair&&'options'in question?<div className={question.images?'grid grid-cols-1 gap-3 sm:grid-cols-3':'grid grid-cols-1 gap-3'}>{options[questionIndex].map((o,i)=><button key={o.i} disabled={locked} onClick={()=>answer(o.i===question.correct,question.hint)} className="min-h-16 overflow-hidden rounded-2xl border-2 border-cyan-300 bg-sky-900/85 text-left font-bold transition hover:border-amber-300 active:scale-[.99] disabled:opacity-70">{question.images&&<img src={question.images[o.i]} alt={o.label} className="h-36 w-full object-cover sm:h-44" loading="eager"/>}<span className="block p-4 text-base sm:text-lg"><span className="mr-2 text-amber-300">{String.fromCharCode(65+i)}.</span>{o.label}</span></button>)}</div>:
 <><div className="grid grid-cols-2 gap-3 sm:gap-8"><div className="space-y-3">{pair.left.map((v,i)=><button key={i} disabled={locked||matches[i]!==undefined} onClick={()=>{audioService.playSfx('click');setSelectedLeft(i);}} className={'min-h-20 w-full rounded-xl border-2 p-2 text-sm font-bold sm:text-lg '+(matches[i]!==undefined?'border-emerald-400 bg-emerald-800/70':selectedLeft===i?'border-amber-300 bg-amber-700':'border-cyan-300 bg-sky-900')}>{v} {matches[i]!==undefined?'✓':''}</button>)}</div><div className="space-y-3">{rightOrder.map(i=><button key={i} disabled={locked||Object.values(matches).includes(i)} onClick={()=>onRight(i)} className={'min-h-20 w-full rounded-xl border-2 p-2 text-sm font-bold sm:text-lg '+(Object.values(matches).includes(i)?'border-emerald-400 bg-emerald-800/70':'border-cyan-300 bg-sky-900')}>{pair.right[i]}</button>)}</div></div><p className="mt-3 text-center text-sm text-amber-100">Chạm thẻ bên trái rồi chọn thẻ bên phải. Cặp đã nối được giữ lại.</p><button disabled={Object.keys(matches).length!==3||locked} onClick={()=>answer([0,1,2].every(i=>matches[i]===i),pair.hint)} className="mt-5 min-h-14 w-full rounded-xl bg-amber-400 p-3 font-black text-slate-950 disabled:opacity-40">✓ XÁC NHẬN 3 CẶP</button>{Object.keys(matches).length>0&&!locked&&<button onClick={()=>{audioService.playSfx('click');setMatches({});setSelectedLeft(null);}} className="mt-3 w-full text-sm font-bold underline">Nối lại từ đầu</button>}</>}
 <div className="mt-5 min-h-14 text-center text-lg font-bold" role="status" aria-live="polite">{feedback}</div></div>}</div></section>;
};
export const isGrade3V12StyleStation=(id:string)=>Boolean(GAMES[id]);
