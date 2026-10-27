/** Keep prior correct picks when a child taps an incorrect image. */
export function selectImage(correct:readonly number[], selected:readonly number[], choice:number) {
 if(!correct.includes(choice)) return {selected:[...selected],wrong:true,complete:false};
 const next=[...new Set([...selected,choice])];
 return {selected:next,wrong:false,complete:correct.every(i=>next.includes(i))};
}
