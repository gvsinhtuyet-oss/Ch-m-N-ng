import type {GameState} from './state';
/** Grade 1 awards a starter item once play begins; the remaining items follow correct answers. */
export function rewardSlots(state:GameState, questionCount:number, starter:boolean):boolean[] {
  return Array.from({length:questionCount+(starter?1:0)},(_,i)=>starter?(i===0?state.phase!=='intro':state.earned.includes(i-1)):state.earned.includes(i));
}
