import * as T from 'three';
import {loadCowrie} from './cowrie-model.js';

// Render every visible treasure into its own display canvas using one shared WebGL context.
let renderer,drag=null,last=0,loading=false;
let gallery,portal,observer,frame=0;
const fingers=new Map();
const cache=new Map();
const desktopGallery=matchMedia('(min-width:700px) and (hover:hover) and (pointer:fine)');
const galleryBounds=()=> (desktopGallery.matches?gallery:gallery.closest('.treasure-inner')).getBoundingClientRect();
// AR is a mobile experience; desktop visitors can rotate models in the mirror.
export function canLaunchAR(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);}
function render(now){
 frame=requestAnimationFrame(render);
 const dt=Math.min(50,now-last);last=now;
 if(!gallery||portal.hidden||portal.classList.contains('show-info')||!renderer)return;
 const bounds=galleryBounds();
 const center=(bounds.left+bounds.right)/2;
 for(const [el,v] of cache){if(!v.model)continue;const r=el.getBoundingClientRect();if(r.bottom<=bounds.top||r.top>=bounds.bottom||r.right<=bounds.left||r.left>=bounds.right)continue;
  const central=Math.abs((r.left+r.right)/2-center)<r.width*.55||drag?.el===el;const desktop=desktopGallery.matches;if(desktop&&!central&&now-(v.lastRender??-Infinity)<100)continue;const ratio=Math.min(devicePixelRatio,desktop?(central?1.15:.8):1.4);const w=Math.round(el.clientWidth*ratio),h=Math.round(el.clientHeight*ratio);if(!w||!h)continue;
  if(v.canvas.width!==w||v.canvas.height!==h){v.canvas.width=w;v.canvas.height=h;v.camera.aspect=w/h;v.camera.updateProjectionMatrix();}
  if(!drag||drag.el!==el)v.angle+=(desktop?Math.min(150,now-(v.lastRender??now)):dt)*.00035;v.lastRender=now;
  v.model.group.rotation.order='YXZ';v.model.group.rotation.y=v.angle;v.model.group.rotation.x=v.tilt;
  if(!desktop||renderer.domElement.width!==w||renderer.domElement.height!==h)renderer.setSize(w,h,false);renderer.render(v.scene,v.camera);v.ctx.clearRect(0,0,w,h);v.ctx.drawImage(renderer.domElement,0,0,w,h);el.classList.add('is-live');
 }
}
async function select(el){
 if(!el||cache.has(el)||loading||el.dataset.failed)return;
 loading=true;
 try{
  if(!renderer){renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(1);renderer.setClearColor(0xffffff,0);frame=requestAnimationFrame(render);}
  const camera=new T.PerspectiveCamera(38,1,.01,100);camera.position.set(0,.32,1.65);camera.lookAt(0,0,0);
  const scene=new T.Scene(),model=await loadCowrie(renderer,scene,el.dataset.model,true);
  const size=model.bounds.getSize(new T.Vector3()),center=model.bounds.getCenter(new T.Vector3());model.group.scale.setScalar(.88/Math.max(size.x,size.y,size.z));model.mesh.position.copy(center).multiplyScalar(-1);
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');el.append(canvas);const zoom=desktopGallery.matches?Number(el.dataset.desktopZoom||.72):1;camera.zoom=zoom;camera.updateProjectionMatrix();cache.set(el,{scene,model,camera,canvas,ctx,angle:-.35,tilt:0,zoom});
 }catch(e){console.warn('Gallery model unavailable',e);el.dataset.failed='1';}finally{loading=false;choose();}
}
function choose(){if(!gallery||portal.hidden||loading||portal.classList.contains('show-info'))return;const bounds=galleryBounds(),horizontal=desktopGallery.matches,mid=horizontal?(bounds.left+bounds.right)/2:(bounds.top+bounds.bottom)/2;let best=null,dist=Infinity;for(const el of gallery.querySelectorAll('[data-model]:not([data-failed])')){if(cache.has(el))continue;const r=el.getBoundingClientRect();if(horizontal?(r.right<=bounds.left-240||r.left>=bounds.right+240):(r.bottom<=bounds.top-240||r.top>=bounds.bottom+240))continue;const d=Math.abs((horizontal?(r.left+r.right)/2:(r.top+r.bottom)/2)-mid);if(d<dist){dist=d;best=el;}}if(best)select(best);}
export function installGallery(root){
 gallery=root;portal=root.closest('.treasure-portal');const scroller=root.closest('.treasure-inner');
 scroller.addEventListener('scroll',choose,{passive:true});gallery.addEventListener('scroll',choose,{passive:true});
 let current=0,lastWheel=-Infinity;const cards=()=>Array.from(gallery.querySelectorAll('.treasure-card'));
 const go=dir=>{const list=cards();current=Math.max(0,Math.min(list.length-1,current+dir));const card=list[current];if(!card)return;gallery.scrollTo({left:card.offsetLeft-(gallery.clientWidth-card.clientWidth)/2,behavior:'smooth'});};
 gallery.addEventListener('scrollend',()=>{if(!desktopGallery.matches)return;const mid=gallery.getBoundingClientRect().left+gallery.clientWidth/2;const list=cards();current=list.reduce((best,card,i)=>Math.abs(card.getBoundingClientRect().left+card.clientWidth/2-mid)<Math.abs(list[best].getBoundingClientRect().left+list[best].clientWidth/2-mid)?i:best,0);});
 portal.querySelector('.treasure-prev')?.addEventListener('click',()=>go(-1));portal.querySelector('.treasure-next')?.addEventListener('click',()=>go(1));
 window.addEventListener('keydown',e=>{if(!desktopGallery.matches||portal.hidden||portal.classList.contains('show-info')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(!e.repeat)go(['ArrowRight','ArrowDown'].includes(e.key)?1:-1);});
 const zoomModel=(el,factor)=>{if(!el)return;const v=cache.get(el),zoom=T.MathUtils.clamp(Number(el.dataset.desktopZoom||.72)*factor,.4,2.5);el.dataset.desktopZoom=String(zoom);if(v){v.zoom=zoom;v.camera.zoom=zoom;v.camera.updateProjectionMatrix();}const img=el.querySelector('img');if(img)img.style.transform=`scale(${zoom})`;};
 gallery.addEventListener('wheel',e=>{if(!desktopGallery.matches)return;e.preventDefault();const el=e.target.closest('[data-model]'),horizontal=!e.ctrlKey&&Math.abs(e.deltaX)>Math.abs(e.deltaY);if(el&&!horizontal){const pixels=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;zoomModel(el,Math.exp(-pixels*.002));return;}const now=performance.now(),delta=horizontal?e.deltaX:e.deltaY;if(Math.abs(delta)>2&&now-lastWheel>220)go(Math.sign(delta));lastWheel=now;},{passive:false});
 observer=new IntersectionObserver(choose,{root:desktopGallery.matches?gallery:scroller,rootMargin:desktopGallery.matches?'0px 240px':'240px 0px',threshold:[0,.25,.5,.75,1]});for(const el of gallery.querySelectorAll('[data-model]'))observer.observe(el);
 const distance=()=>{const [a,b]=fingers.values();return b?Math.hypot(a.x-b.x,a.y-b.y):0;};
 gallery.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-model]');if(!el||(drag&&drag.el!==el)||fingers.size>=2)return;if(!drag){select(el);drag={moved:false,el};}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(fingers.size===2)drag.moved=true;el.setPointerCapture(e.pointerId);});
 gallery.addEventListener('pointermove',e=>{if(!drag||!fingers.has(e.pointerId))return;const v=cache.get(drag.el),old=fingers.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y;if(fingers.size===2){const before=distance();fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});const after=distance();if(before>0&&v){v.zoom=T.MathUtils.clamp(v.zoom*after/before,.6,2.5);v.camera.zoom=v.zoom;v.camera.updateProjectionMatrix();}return;}if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;if(v){v.angle+=dx*.012;v.tilt+=dy*.012;}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});});
 const finish=e=>{if(!drag||!fingers.has(e.pointerId))return;fingers.delete(e.pointerId);if(e.type==='pointercancel')drag.moved=true;if(fingers.size)return;if(drag.moved){const link=drag.el.closest('.treasure-card');link.dataset.dragged='1';setTimeout(()=>delete link.dataset.dragged,400);}drag=null;};gallery.addEventListener('pointerup',finish);gallery.addEventListener('pointercancel',finish);
 gallery.addEventListener('click',e=>{const card=e.target.closest('.treasure-card');if(!canLaunchAR()||card?.dataset.dragged){e.preventDefault();return;}const id=card?.querySelector('[data-model]')?.dataset.model;if(!id)return;const a=document.createElement('a');a.rel='ar';if(a.relList?.supports?.('ar')){e.preventDefault();a.href=`assets/composition/${id}-ar-table.usdz`;a.innerHTML=`<img src="assets/composition/${id}-journey/06.png" alt="">`;a.style.cssText='position:fixed;left:-1000px;top:0;width:1px;height:1px;overflow:hidden';document.body.append(a);a.click();setTimeout(()=>a.remove(),1000);}});
 new MutationObserver(()=>{if(!portal.hidden){portal.querySelector('.treasure-inner').scrollTop=0;gallery.scrollLeft=0;current=0;choose();}}).observe(portal,{attributes:true,attributeFilter:['hidden']});
}
export function prepareGallery(root){installGallery(root);}
