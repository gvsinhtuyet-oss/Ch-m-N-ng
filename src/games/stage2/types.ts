export interface QuestionBase { id: string; level: string; prompt: string; hint: string }
export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice' | 'image'; options: {text: string; image?: string}[]; answer: number;
}
export interface MatchQuestion extends QuestionBase {
  kind: 'match'; left: string[]; right: string[]; solution: number[];
}
export type Question = ChoiceQuestion | MatchQuestion;
export interface GameConfig {
  stationId: string; stationName: string; title: string;
  background: string; victoryBackground: string;
  collectible: {icon: string; name: string; image?: string};
  intro: {heading: string; story: string; call: string; readyLabel?: string};
  victory: {praise: string; achievement: string; reward: string};
  questions: Question[];
}
export function validateConfig(c: GameConfig): void {
  if (c.questions.length !== 5) throw new Error('Cần đúng 5 câu hỏi');
  if (new Set(c.questions.map(q=>q.id)).size !== 5) throw new Error('Trùng mã câu hỏi');
  if (c.questions.map(q=>q.kind).join(',') !== 'image,choice,choice,match,choice') throw new Error('Sai thứ tự loại câu hỏi');
  for (const q of c.questions) {
    if (!q.prompt || !q.hint) throw new Error('Thiếu câu hỏi hoặc gợi ý');
    if(q.kind === 'match') {
      if(q.left.length!==3 || q.right.length!==3 || q.solution.length!==3 || new Set(q.solution).size!==3 || q.solution.some(i=>!Number.isInteger(i)||i<0||i>2)) throw new Error('Cần ba cặp một-một');
    } else if(q.options.length!==3 || !Number.isInteger(q.answer) || q.answer<0 || q.answer>2 || (q.kind==='image' && q.options.some(o=>!o.image))) throw new Error('Lựa chọn không hợp lệ');
  }
}
