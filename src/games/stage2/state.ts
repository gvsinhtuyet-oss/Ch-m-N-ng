export type Phase = 'intro'|'question'|'review'|'victory';
export interface GameState { phase: Phase; index: number; reviewing: boolean; earned: number[]; missed: number[]; result: boolean|null; total?: number }
export const initialState = (): GameState => ({phase:'intro',index:0,reviewing:false,earned:[],missed:[],result:null});
export type Action = {type:'start'; count?:number} | {type:'advance'|'review'|'restart'} | {type:'answer';correct:boolean};
export function gameReducer(s: GameState, a: Action): GameState {
  if(a.type==='restart') return initialState();
  if(a.type==='start') return s.phase==='intro'? {...s,phase:'question',...(a.count?{total:a.count}:{})}:s;
  if(a.type==='review') return s.phase==='review'&&s.missed.length?{...s,phase:'question',reviewing:true,index:s.missed[0],result:null}:s;
  if(a.type==='answer') {
    if(s.phase!=='question'||s.result!==null) return s;
    return {...s,result:a.correct,earned:a.correct?[...new Set([...s.earned,s.index])]:s.earned,missed:a.correct?s.missed.filter(i=>i!==s.index):[...new Set([...s.missed,s.index])].sort()};
  }
  if(a.type==='advance'&&s.phase==='question'&&s.result!==null) {
    if(s.reviewing) return s.missed.length?{...s,index:s.missed[0],result:null}:{...s,phase:'victory',result:null};
    if(s.index<(s.total??5)-1) return {...s,index:s.index+1,result:null};
    return {...s,phase:s.missed.length?'review':'victory',result:null};
  }
  return s;
}
export function isCorrectMatch(solution: number[], pairs: Record<number,number>): boolean {
  return Object.keys(pairs).length===solution.length && solution.every((r,l)=>pairs[l]===r);
}
export function connectPair(pairs: Record<number,number>, left: number, right: number): Record<number,number> {
  return {...Object.fromEntries(Object.entries(pairs).filter(([l,r])=>Number(l)!==left && r!==right)),[left]:right};
}
