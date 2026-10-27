import type {GameConfig} from '../types';

function order(count:number,random:()=>number):number[] {
  const indices=Array.from({length:count},(_,i)=>i);
  for(let i=count-1;i>0;i--){const j=Math.floor(random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  return indices;
}

/** Create one immutable arrangement per play; review reuses it. */
export function shuffleGrade1(config:GameConfig,random:()=>number=Math.random):GameConfig {
  if(!config.stationId.startsWith('g1-'))return config;
  return {...config,questions:config.questions.map((q,index)=>{
    if(index===1)return q;
    if(q.kind==='match'){
      const positions=order(q.right.length,random);
      return {...q,right:positions.map(i=>q.right[i]),solution:q.solution.map(i=>positions.indexOf(i))};
    }
    const positions=order(q.options.length,random);
    return {...q,options:positions.map(i=>q.options[i]),answer:positions.indexOf(q.answer),...(q.answers?{answers:q.answers.map(i=>positions.indexOf(i))}:{})};
  })};
}
