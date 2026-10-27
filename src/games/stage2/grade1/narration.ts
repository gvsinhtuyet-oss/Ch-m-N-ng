/** Short grade-one prompts generated from each station's approved name and reward. */
export function introNarration(title:string,reward:string):string {
  return `Chào mừng em đến với thử thách ${title}! Hãy trả lời bốn câu hỏi để nhận bốn ${reward} nhé. Bấm bắt đầu nào!`;
}
export function victoryNarration(title:string,reward:string):string {
  return `Chúc mừng em đã hoàn thành thử thách ${title} và nhận đủ bốn ${reward}. Em thật giỏi!`;
}
