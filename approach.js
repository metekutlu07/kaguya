// A single rail along the viewing axis. No pointer-position parallax.
import {journeyLength,openingPauses} from './chapters.js';
export const approachDistance=2.0;
export function createApproach(surface){
 const resume=location.hash==='#treasures'||new URLSearchParams(location.search).get('collection')==='1';
 let target=resume?1:0,position=target,active=null,lastY=0,lastX=0,lastTime=0,gesture=null,turn=0,rotation=0,hold=null;
 const hint=document.querySelector('.note');if(hint){hint.style.pointerEvents='none'}
 const clamp=x=>Math.max(0,Math.min(1,x));
 // Compress only the celestial history segment, leaving the other chapters' pacing intact.
 const desktop=matchMedia('(hover: hover) and (pointer: fine)');
 const start=.20,end=.85,ratio=.70;
 // Continuous desktop rail. Give the meteor a little more scroll distance,
 // without discrete stops, mandatory waits or automatic scene completion.
 const meteorStart=.59,meteorEnd=.85,meteorWeight=1.5;
 const desktopInput=x=>x<=meteorStart?x:x<=meteorEnd?meteorStart+(x-meteorStart)*meteorWeight:x+(meteorEnd-meteorStart)*(meteorWeight-1);
 const desktopOutput=x=>x<=meteorStart?x:x<=desktopInput(meteorEnd)?meteorStart+(x-meteorStart)/meteorWeight:x-(meteorEnd-meteorStart)*(meteorWeight-1);
 const desktopMove=delta=>{target=clamp(desktopOutput(desktopInput(target*journeyLength)+delta*.125)/journeyLength);};
 const toInput=x=>x<=start?x:x<=end?start+(x-start)*ratio:x-(end-start)*(1-ratio);
 const fromInput=x=>x<=start?x:x<=toInput(end)?start+(x-start)/ratio:x+(end-start)*(1-ratio);
 const move=delta=>{target=clamp(fromInput(toInput(target*journeyLength)+delta)/journeyLength);if(delta>0&&target>1-.17/journeyLength)target=1;};
 document.querySelector('.restart')?.addEventListener('click',()=>{target=0;position=0;hold=null;history.replaceState(null,'',location.pathname);});
 document.querySelector('.skip-journey')?.addEventListener('click',()=>{target=1;position=1;hold=null;});
 surface.style.touchAction='none';
 surface.addEventListener('wheel',e=>{
  e.preventDefault();
  const pixels=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  if(!desktop.matches){move(pixels/(innerHeight*2.6));return;}
  // Every event contributes distance, including tiny trackpad movements.
  // Soft-limit unusually large deltas so a flick cannot leap over a chapter.
  const desktopPixels=e.deltaMode===1?e.deltaY*40:pixels;
  const normalized=desktopPixels/Math.max(650,Math.min(innerHeight,1100));
  desktopMove(.24*Math.tanh(normalized*5.5));
 },{passive:false});
 surface.addEventListener('pointerdown',e=>{if(active!==null||e.button!==0)return;active=e.pointerId;lastY=e.clientY;lastX=e.clientX;gesture=null;surface.setPointerCapture(e.pointerId)});
 surface.addEventListener('pointermove',e=>{if(e.pointerId!==active||desktop.matches)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(!gesture&&Math.hypot(dx,dy)<4)return;if(!gesture)gesture=Math.abs(dx)>Math.abs(dy)*1.25?'ignore':'advance';if(gesture==='advance')move(-dy/(innerHeight*2.3));lastX=e.clientX;lastY=e.clientY});
 const release=e=>{if(e.pointerId===active)active=null};
 surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);
 window.addEventListener('keydown',e=>{
  if(!document.querySelector('.language-gate')?.hidden||document.querySelector('.treasure-portal')?.style.pointerEvents==='auto'||e.target.closest?.('input,textarea,select,button,[contenteditable]'))return;
  const keys=['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','PageDown','PageUp','Home','End'];
  if(!keys.includes(e.key))return;
  e.preventDefault();if(e.repeat)return;
  if(e.key==='Home'||e.key==='End'){target=e.key==='Home'?0:1;if(desktop.matches){position=target;hold=null;}}
  else {const dir=['ArrowDown','ArrowRight','PageDown'].includes(e.key)?1:-1;if(desktop.matches)desktopMove(dir*(e.key.startsWith('Page')?.26:.10));else move(dir*.22);}
 });
 return {step(now){const dt=lastTime?Math.min(.1,(now-lastTime)/1000):1/60;lastTime=now;
  if(desktop.matches){
   // Short damping follows the user's exact progress and never crosses the
   // target. No openingPauses here: those caused a desktop boundary loop.
   position+=(target-position)*(1-Math.exp(-dt*14));
   if(Math.abs(target-position)<.00001)position=target;
   rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);
  }
  if(hold){if(now>=hold.until||(target-hold.at)*hold.dir<0){position=hold.at+hold.dir*.000001;hold=null;}else return position*position*(3-2*position);}
  const speed=desktop.matches?(position*journeyLength<1.20?2.8:4.5):(position*journeyLength<1.20?1.85:4);let next=position+(target-position)*(1-Math.exp(-dt*speed));if(Math.abs(target-next)<.0005)next=target;
  const dir=Math.sign(next-position),pauses=dir>0?openingPauses:[...openingPauses].reverse();
  for(const pause of pauses){if((position-pause.at)*dir<0&&(next-pause.at)*dir>=0){next=pause.at;hold={at:pause.at,until:now+pause.ms,dir};break;}}
  position=next;rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);},get progress(){return position},get rotation(){return rotation}};
}
