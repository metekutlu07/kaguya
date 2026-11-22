// A single rail along the viewing axis. No pointer-position parallax.
import {journeyLength,openingPauses,treasureMarkers} from './chapters.js';
export const approachDistance=2.0;
export function createApproach(surface){
 const resume=location.hash==='#treasures'||new URLSearchParams(location.search).get('collection')==='1';
 let target=resume?1:0,position=target,active=null,lastY=0,lastX=0,lastTime=0,gesture=null,turn=0,rotation=0,hold=null;
 const hint=document.querySelector('.note');if(hint){hint.style.pointerEvents='none'}
 const clamp=x=>Math.max(0,Math.min(1,x));
 // Compress only the celestial history segment, leaving the other chapters' pacing intact.
 const desktop=matchMedia('(hover: hover) and (pointer: fine)');
 const start=.20,end=.85,ratio=.70;
 let wheelAt=-Infinity,wheelTravel=0,wheelDir=0,wheelUsed=false;
 // Five beats per treasure: forest, reveal, turn and narration, contemplation, dissolution.
 const desktopStops=[0,.20,.40,.59,.69,.85,1.17,...treasureMarkers.flatMap((p,i)=>{const base=p*journeyLength;return [base-(i===0?.13:.081),base+.012,base+.26,base+.35,base+(i===treasureMarkers.length-1?.49:.46)];}),treasureMarkers.at(-1)*journeyLength+1.10,journeyLength].map(p=>p/journeyLength);
 let pendingBeat=0;
 const desktopAdvance=dir=>{const epsilon=.0001;if(Math.abs(target-position)>.0005){pendingBeat=dir;return;}pendingBeat=0;target=dir>0?(desktopStops.find(p=>p>target+epsilon)??1):([...desktopStops].reverse().find(p=>p<target-epsilon)??0);};
 const toInput=x=>x<=start?x:x<=end?start+(x-start)*ratio:x-(end-start)*(1-ratio);
 const fromInput=x=>x<=start?x:x<=toInput(end)?start+(x-start)/ratio:x+(end-start)*(1-ratio);
 const move=delta=>{target=clamp(fromInput(toInput(target*journeyLength)+delta)/journeyLength);if(delta>0&&target>1-.17/journeyLength)target=1;};
 document.querySelector('.restart')?.addEventListener('click',()=>{target=0;position=0;hold=null;pendingBeat=0;history.replaceState(null,'',location.pathname);});
 document.querySelector('.skip-journey')?.addEventListener('click',()=>{target=1;position=1;hold=null;pendingBeat=0;});
 surface.style.touchAction='none';
 surface.addEventListener('wheel',e=>{
  e.preventDefault();
  const pixels=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  if(!desktop.matches){move(pixels/(innerHeight*2.6));return;}
  // A wheel notch or trackpad gesture advances one beat; momentum cannot skip it.
  const now=performance.now(),dir=Math.sign(pixels);
  if(!dir)return;
  if(now-wheelAt>200||dir!==wheelDir){wheelTravel=0;wheelDir=dir;wheelUsed=false;}
  wheelAt=now;
  wheelTravel+=Math.abs(pixels);
  if(!wheelUsed&&wheelTravel>=12){wheelUsed=true;desktopAdvance(dir);}
 },{passive:false});
 surface.addEventListener('pointerdown',e=>{if(active!==null||e.button!==0)return;active=e.pointerId;lastY=e.clientY;lastX=e.clientX;gesture=null;surface.setPointerCapture(e.pointerId)});
 surface.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(!gesture&&Math.hypot(dx,dy)<4)return;if(!gesture)gesture=Math.abs(dx)>Math.abs(dy)*1.25?'ignore':'advance';if(gesture==='advance')move(-dy/(innerHeight*2.3));lastX=e.clientX;lastY=e.clientY});
 const release=e=>{if(e.pointerId===active)active=null};
 surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);
 window.addEventListener('keydown',e=>{
  if(!document.querySelector('.language-gate')?.hidden||document.querySelector('.treasure-portal')?.style.pointerEvents==='auto'||e.target.closest?.('input,textarea,select,button,[contenteditable]'))return;
  const keys=['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','PageDown','PageUp','Home','End'];
  if(!keys.includes(e.key))return;
  e.preventDefault();if(e.repeat)return;
  if(e.key==='Home'){target=0;pendingBeat=0;}else if(e.key==='End'){target=1;pendingBeat=0;}
  else {const dir=['ArrowDown','ArrowRight','PageDown'].includes(e.key)?1:-1;if(desktop.matches)desktopAdvance(dir);else move(dir*.22);}
 });
 return {step(now){const dt=lastTime?Math.min(.1,(now-lastTime)/1000):1/60;lastTime=now;
  if(hold){if(now>=hold.until||(target-hold.at)*hold.dir<0){position=hold.at+hold.dir*.000001;hold=null;}else return position*position*(3-2*position);}
  const speed=desktop.matches?(position*journeyLength<1.20?2.8:4.5):(position*journeyLength<1.20?1.85:4);let next=position+(target-position)*(1-Math.exp(-dt*speed));if(Math.abs(target-next)<.0005)next=target;
  const dir=Math.sign(next-position),pauses=dir>0?openingPauses:[...openingPauses].reverse();
  for(const pause of pauses){if((position-pause.at)*dir<0&&(next-pause.at)*dir>=0){next=pause.at;hold={at:pause.at,until:now+pause.ms,dir};break;}}
  position=next;if(desktop.matches&&pendingBeat&&position===target&&!hold)desktopAdvance(pendingBeat);rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);},get progress(){return position},get rotation(){return rotation}};
}
