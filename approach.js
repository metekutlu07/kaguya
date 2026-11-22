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
 let wheelAt=-Infinity,wheelTravel=0,wheelDir=0,wheelUsed=false,wheelMagnitude=0,wheelBeatAt=-Infinity;
 // Desktop stops are chosen at completed visual states, not inside fades.
 // The meteor crosses its entire arc in one timed beat; each treasure has four
 // visible beats: forest, reveal, narrated turn, and dissolution.
 const desktopStops=[0,.20,.40,.85,1.15,...treasureMarkers.flatMap((p,i)=>{const base=p*journeyLength;return [base-(i===0?.10:.081),base+.012,base+.26,base+(i===treasureMarkers.length-1?.49:.46)];}),treasureMarkers.at(-1)*journeyLength+1.13,journeyLength].map(p=>p/journeyLength);
 let desktopTransition=null,desktopQueue=[];
 const desktopAdvance=dir=>{
  if(desktopTransition){if(desktopQueue.at(-1)!==dir)desktopQueue=[];if(desktopQueue.length<2)desktopQueue.push(dir);return;}
  const epsilon=.0001,next=dir>0?(desktopStops.find(p=>p>position+epsilon)??1):([...desktopStops].reverse().find(p=>p<position-epsilon)??0);
  if(Math.abs(next-position)<epsilon)return;
  const meteorBeat=Math.min(position,next)*journeyLength<.60&&Math.max(position,next)*journeyLength>.80;
  target=next;desktopTransition={from:position,to:next,elapsed:0,duration:meteorBeat?2.2:.65};
 };
 const resetDesktop=()=>{desktopTransition=null;desktopQueue=[];wheelAt=wheelBeatAt=-Infinity;wheelTravel=wheelMagnitude=0;wheelUsed=false;};
 const toInput=x=>x<=start?x:x<=end?start+(x-start)*ratio:x-(end-start)*(1-ratio);
 const fromInput=x=>x<=start?x:x<=toInput(end)?start+(x-start)/ratio:x+(end-start)*(1-ratio);
 const move=delta=>{target=clamp(fromInput(toInput(target*journeyLength)+delta)/journeyLength);if(delta>0&&target>1-.17/journeyLength)target=1;};
 document.querySelector('.restart')?.addEventListener('click',()=>{target=0;position=0;hold=null;resetDesktop();history.replaceState(null,'',location.pathname);});
 document.querySelector('.skip-journey')?.addEventListener('click',()=>{target=1;position=1;hold=null;resetDesktop();});
 surface.style.touchAction='none';
 surface.addEventListener('wheel',e=>{
  e.preventDefault();
  const pixels=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
  if(!desktop.matches){move(pixels/(innerHeight*2.6));return;}
  // A wheel notch or trackpad gesture advances one beat; momentum cannot skip it.
  const now=performance.now(),dir=Math.sign(pixels);
  if(!dir)return;
  const magnitude=Math.abs(pixels),fresh=now-wheelAt>140||dir!==wheelDir;
  const renewed=now-wheelBeatAt>220&&magnitude>=18&&magnitude>wheelMagnitude*1.8;
  const notch=e.deltaMode!==0&&now-wheelBeatAt>120;
  if(fresh||renewed||notch){wheelTravel=0;wheelDir=dir;wheelUsed=false;}
  wheelAt=now;
  wheelMagnitude=magnitude;wheelTravel+=magnitude;
  if(!wheelUsed&&wheelTravel>=12){wheelUsed=true;wheelBeatAt=now;desktopAdvance(dir);}
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
  if(e.key==='Home'||e.key==='End'){target=e.key==='Home'?0:1;if(desktop.matches){resetDesktop();position=target;hold=null;}}
  else {const dir=['ArrowDown','ArrowRight','PageDown'].includes(e.key)?1:-1;if(desktop.matches)desktopAdvance(dir);else move(dir*.22);}
 });
 return {step(now){const dt=lastTime?Math.min(.1,(now-lastTime)/1000):1/60;lastTime=now;
  if(desktop.matches){
   // Never run the mobile boundary holds on this discrete rail. A hold at an
   // exact stop used to overshoot its target and trigger itself in reverse.
   if(desktopTransition){const beat=desktopTransition;beat.elapsed+=dt;const u=Math.min(1,beat.elapsed/beat.duration),ease=u*u*(3-2*u);position=beat.from+(beat.to-beat.from)*ease;if(u===1){position=target=beat.to;desktopTransition=null;if(desktopQueue.length)desktopAdvance(desktopQueue.shift());}}
   else if(position!==target)position=target;
   rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);
  }
  if(hold){if(now>=hold.until||(target-hold.at)*hold.dir<0){position=hold.at+hold.dir*.000001;hold=null;}else return position*position*(3-2*position);}
  const speed=desktop.matches?(position*journeyLength<1.20?2.8:4.5):(position*journeyLength<1.20?1.85:4);let next=position+(target-position)*(1-Math.exp(-dt*speed));if(Math.abs(target-next)<.0005)next=target;
  const dir=Math.sign(next-position),pauses=dir>0?openingPauses:[...openingPauses].reverse();
  for(const pause of pauses){if((position-pause.at)*dir<0&&(next-pause.at)*dir>=0){next=pause.at;hold={at:pause.at,until:now+pause.ms,dir};break;}}
  position=next;rotation+=(turn-rotation)*(1-Math.exp(-dt*7));return position*position*(3-2*position);},get progress(){return position},get rotation(){return rotation}};
}
