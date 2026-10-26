// Particle animation reused from the approved V18; cleanup owned by React.
export function startFireworks(canvas: HTMLCanvasElement,lightweight=false){
 const context=canvas.getContext('2d');if(!context)return ()=>{};const ctx: CanvasRenderingContext2D=context;let particles: {x:number;y:number;vx:number;vy:number;life:number;color:string;r:number}[]=[],last=0,raf=0;
 const density=lightweight?1:Math.min(devicePixelRatio||1,2);
 const count=lightweight?36:76;
 const palette=['#ffe86a','#ff66cf','#70e9ff','#93ff9a','#ffffff','#ffac5e','#b6a4ff'];
 function resize(){const d=density;canvas.width=Math.round(canvas.clientWidth*d);canvas.height=Math.round(canvas.clientHeight*d)}
 function burst(){
  const x=canvas.width*(.12+Math.random()*.76),y=canvas.height*(.08+Math.random()*.48);
  const color=palette[Math.floor(Math.random()*palette.length)];
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count+Math.random()*.08,v=(1.3+Math.random()*3.6)*Math.max(1,canvas.width/1100);
   particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:1,color,r:1.2+Math.random()*2.2});
  }
  const limit=lightweight?240:850;if(particles.length>limit)particles=particles.slice(-limit);
 }
 resize();burst();burst();
 let previousFrame=0;
 function draw(time: number){
  if(!canvas.isConnected){cancelAnimationFrame(raf);return}
  if(canvas.width!==Math.round(canvas.clientWidth*density)||canvas.height!==Math.round(canvas.clientHeight*density))resize();
  const step=lightweight?Math.min(3,previousFrame?(time-previousFrame)/16.667:1):1;previousFrame=time;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(time-last>460){last=time;burst()}
  ctx.globalCompositeOperation='lighter';
  for(const p of particles){
   p.x+=p.vx*step;p.y+=p.vy*step;p.vx*=Math.pow(.991,step);p.vy=p.vy*Math.pow(.991,step)+.017*step;p.life-=.012*step;
   ctx.globalAlpha=Math.max(0,p.life);
   ctx.shadowBlur=lightweight?0:17;ctx.shadowColor=p.color;ctx.fillStyle=p.color;
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
  particles=particles.filter(p=>p.life>0);
  raf=requestAnimationFrame(draw);
 }
 raf=requestAnimationFrame(draw);
 return ()=>cancelAnimationFrame(raf);
}
