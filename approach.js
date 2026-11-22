// A single rail along the viewing axis. No pointer-position parallax.
import {journeyLength,openingPauses} from './chapters.js';
export const approachDistance=2.0;
export function createApproach(surface){
 const resume=location.hash==='#treasures'||new URLSearchParams(location.search).get('collection')==='1';
 let target=resume?1:0,position=target,active=null,lastY=0,lastX=0,lastTime=0,gesture=null,turn=0,rotation=0,hold=null;
 const hint=document.querySelector('.note');if(hint){hint.style.pointerEvents='none'}
 const clamp=x=>Math.max(0,Math.min(1,x));
 // Compress only the celestial history segment, leaving the other chapters' pacing intact.
 const start=.20,end=.85,ratio=.70;
 const toInput=x=>x<=start?x:x<=end?start+(x-start)*ratio:x-(end-start)*(1-ratio);
 const fromInput=x=>x<=start?x:x<=toInput(end)?start+(x-start)/ratio:x+(end-start)*(1-ratio);
 const move=delta=>{target=clamp(fromInput(toInput(target*journeyLength)+delta)/journeyLength);if(delta>0&&target>1-.17/journeyLength)target=1;};
 document.querySelector('.restart')?.addEventListener('click',()=>{target=0;position=0;hold=null;history.replaceState(null,'',location.pathname);});
 document.querySelector('.skip-journey')?.addEventListener('click',()=>{target=1;position=1;hold=null;});
 surface.style.touchAction='none';
 surface.addEventListener('wheel',e=>{e.preventDefault();move((e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY)/(innerHeight*2.6))},{passive:false});
 surface.addEventListener('pointerdown',e=>{if(active!==null||e.button!==0)return;active=e.pointerId;lastY=e.clientY;lastX=e.clientX;gesture=null;surface.setPointerCapture(e.pointerId)});
 surface.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(!gesture&&Math.hypot(dx,dy)<4)return;if(!gesture)gesture=Math.abs(dx)>Math.abs(dy)*1.25?'ignore':'advance';if(gesture==='advance')move(-dy/(innerHeight*2.3));lastX=e.clientX;lastY=e.clientY});
 const release=e=>{if(e.pointerId===active)active=null};
 surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);
 window.addEventListener('keydown',e=>{if(document.querySelector('.treasure-portal')?.style.pointerEvents==='auto')return;if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')target=0;else if(e.key==='End')target=1;else move(['ArrowDown','PageDown'].includes(e.key)?.22:-.22)}});
 return {step(now){const dt=lastTime?Math.min(.1,(now-lastTime)/1000):1/60;lastTime=now;
  if(hold){if(now>=hold.until||(target-hold.at)*hold.dir<0){position=hold.at+hold.dir*.000001;hold=null;}else return position*position*(3-2*position);}
  const speed=position*journeyLength<1.20?1.85:4;let next=position+(target-position)*(1-Math.exp(-dt*speed));if(Math.abs(target-next)<.0005)next=target;
  const dir=Math.sign(next-position),pauses=dir>0?openingPauses:[...openingPauses].reverse();
  for(const pause of pauses){if((position-pause.at)*dir<0&&(next-pause.at)*dir>=0){next=pause.at;hold={at:pause.at,until:now+pause.ms,dir};break;}}
  position=next;rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);},get progress(){return position},get rotation(){return rotation}};
}
