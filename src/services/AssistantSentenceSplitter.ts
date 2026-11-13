/** Same punctuation boundaries without RegExp lookbehind (Safari before 16.4). */
export function splitAssistantSentences(text:string):string[]{
  const parts=text.split(/([.!?])\s+/);
  const sentences:string[]=[];
  for(let i=0;i<parts.length;i+=2)sentences.push(parts[i]+(parts[i+1]||''));
  return sentences;
}
