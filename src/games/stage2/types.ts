export interface QuestionBase { id: string; level: string; prompt: string; hint: string }
export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice' | 'image'; answers?: number[]; options: {text: string; image?: string}[]; answer: number;
}
export interface MatchQuestion extends QuestionBase {
  kind: 'match'; left: string[]; right: string[]; solution: number[];
}
export type Question = ChoiceQuestion | MatchQuestion;
export interface GameConfig {
  stationId: string; stationName: string; title: string;
  /** Opt-in only; approved legacy presentation remains the default. */
  layout?: 'safe-v1';
  background: string; victoryBackground: string;
  collectible: {icon: string; name: string; image?: string};
  intro: {heading: string; story: string; call: string; readyLabel?: string};
  victory: {praise: string; achievement: string; reward: string};
  questions: Question[];
}
export function validateConfig(c: GameConfig): void {
  const count=c.stationId.startsWith('g1-')?4:5;
  if (c.questions.length !== count) throw new Error('Sai số câu hỏi');
  if (new Set(c.questions.map(q=>q.id)).size !== count) throw new Error('Trùng mã câu hỏi');
  const kinds=count===4?'image,choice,match,choice':'image,choice,choice,match,choice';
  if (c.questions.map(q=>q.kind).join(',') !== kinds) throw new Error('Sai thứ tự loại câu hỏi');
  for (const q of c.questions) {
    if (!q.prompt || !q.hint) throw new Error('Thiếu câu hỏi hoặc gợi ý');
    if(q.kind === 'match') {
      const n=c.stationId.startsWith('g1-')?2:3; if(q.left.length!==n || q.right.length!==n || q.solution.length!==n || new Set(q.solution).size!==n || q.solution.some(i=>!Number.isInteger(i)||i<0||i>=n)) throw new Error('Số cặp nối không hợp lệ');
    } else if((c.stationId.startsWith('g1-') && q.id==='q2'?q.options.length!==2:q.options.length!==3) || !Number.isInteger(q.answer) || q.answer<0 || q.answer>=q.options.length || (q.kind==='image' && q.options.some(o=>!o.image))) throw new Error('Lựa chọn không hợp lệ');
  }
}
