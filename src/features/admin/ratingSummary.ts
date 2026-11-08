export function summarizeRatings(ratings:Record<string,number[]>, ids:string[]) {
 const counts=[0,0,0,0,0];
 let available=ids.length>0;
 for(const id of ids){
  const values=ratings[id];
  if(!Array.isArray(values)||values.length!==5||values.some(value=>!Number.isInteger(value)||value<0)){available=false;continue;}
  values.forEach((value,index)=>{counts[index]+=value;});
 }
 const total=counts.reduce((sum,value)=>sum+value,0);
 const average=total?counts.reduce((sum,value,index)=>sum+value*(index+1),0)/total:0;
 return {counts,total,average,available};
}
export const formatRating=(value:number)=>value.toLocaleString('vi-VN',{minimumFractionDigits:1,maximumFractionDigits:1});
