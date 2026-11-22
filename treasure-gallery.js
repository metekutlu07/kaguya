import * as T from 'three';
import {loadCowrie} from './cowrie-model.js';

// Render every visible treasure into its own display canvas using one shared WebGL context.
let renderer,drag=null,last=0,loading=false;
let gallery,portal,observer,frame=0;
const fingers=new Map();
const cache=new Map();
// AR is a mobile experience; desktop visitors can rotate models in the mirror.
export function canLaunchAR(){return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);}
function render(now){
 frame=requestAnimationFrame(render);
 const dt=Math.min(50,now-last);last=now;
 if(!gallery||portal.hidden||portal.classList.contains('show-info')||!renderer)return;
 const bounds=gallery.closest('.treasure-inner').getBoundingClientRect();
 for(const [el,v] of cache){if(!v.model)continue;const r=el.getBoundingClientRect();if(r.bottom<=bounds.top||r.top>=bounds.bottom)continue;
  const w=Math.round(el.clientWidth*Math.min(devicePixelRatio,1.4)),h=Math.round(el.clientHeight*Math.min(devicePixelRatio,1.4));if(!w||!h)continue;
  if(v.canvas.width!==w||v.canvas.height!==h){v.canvas.width=w;v.canvas.height=h;v.camera.aspect=w/h;v.camera.updateProjectionMatrix();}
  if(!drag||drag.el!==el)v.angle+=dt*.00035;
  v.model.group.rotation.order='YXZ';v.model.group.rotation.y=v.angle;v.model.group.rotation.x=v.tilt;
  renderer.setSize(w,h,false);renderer.render(v.scene,v.camera);v.ctx.clearRect(0,0,w,h);v.ctx.drawImage(renderer.domElement,0,0,w,h);el.classList.add('is-live');
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
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');el.append(canvas);cache.set(el,{scene,model,camera,canvas,ctx,angle:-.35,tilt:0,zoom:1});
 }catch(e){console.warn('Gallery model unavailable',e);el.dataset.failed='1';}finally{loading=false;choose();}
}
function choose(){if(!gallery||portal.hidden||loading||portal.classList.contains('show-info'))return;const bounds=gallery.closest('.treasure-inner').getBoundingClientRect(),mid=(bounds.top+bounds.bottom)/2;let best=null,dist=Infinity;for(const el of gallery.querySelectorAll('[data-model]:not([data-failed])')){if(cache.has(el))continue;const r=el.getBoundingClientRect();if(r.bottom<=bounds.top-240||r.top>=bounds.bottom+240)continue;const d=Math.abs((r.top+r.bottom)/2-mid);if(d<dist){dist=d;best=el;}}if(best)select(best);}
export function installGallery(root){
 gallery=root;portal=root.closest('.treasure-portal');const scroller=root.closest('.treasure-inner');
 scroller.addEventListener('scroll',choose,{passive:true});
 observer=new IntersectionObserver(choose,{root:scroller,rootMargin:'240px 0px',threshold:[0,.25,.5,.75,1]});for(const el of gallery.querySelectorAll('[data-model]'))observer.observe(el);
 const distance=()=>{const [a,b]=fingers.values();return b?Math.hypot(a.x-b.x,a.y-b.y):0;};
 gallery.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-model]');if(!el||(drag&&drag.el!==el)||fingers.size>=2)return;if(!drag){select(el);drag={moved:false,el};}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(fingers.size===2)drag.moved=true;el.setPointerCapture(e.pointerId);});
 gallery.addEventListener('pointermove',e=>{if(!drag||!fingers.has(e.pointerId))return;const v=cache.get(drag.el),old=fingers.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y;if(fingers.size===2){const before=distance();fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});const after=distance();if(before>0&&v){v.zoom=T.MathUtils.clamp(v.zoom*after/before,.6,2.5);v.camera.zoom=v.zoom;v.camera.updateProjectionMatrix();}return;}if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;if(v){v.angle+=dx*.012;v.tilt+=dy*.012;}fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});});
 const finish=e=>{if(!drag||!fingers.has(e.pointerId))return;fingers.delete(e.pointerId);if(e.type==='pointercancel')drag.moved=true;if(fingers.size)return;if(drag.moved){const link=drag.el.closest('.treasure-card');link.dataset.dragged='1';setTimeout(()=>delete link.dataset.dragged,400);}drag=null;};gallery.addEventListener('pointerup',finish);gallery.addEventListener('pointercancel',finish);
 gallery.addEventListener('click',e=>{const card=e.target.closest('.treasure-card');if(!canLaunchAR()||card?.dataset.dragged){e.preventDefault();return;}const id=card?.querySelector('[data-model]')?.dataset.model;if(!id)return;const a=document.createElement('a');a.rel='ar';if(a.relList?.supports?.('ar')){e.preventDefault();a.href=`assets/composition/${id}-small.usdz`;a.innerHTML=`<img src="assets/composition/${id}-journey/06.png" alt="">`;a.style.cssText='position:fixed;left:-1000px;top:0;width:1px;height:1px;overflow:hidden';document.body.append(a);a.click();setTimeout(()=>a.remove(),1000);}});
 new MutationObserver(()=>{if(!portal.hidden){portal.querySelector('.treasure-inner').scrollTop=0;choose();}}).observe(portal,{attributes:true,attributeFilter:['hidden']});
}
export function prepareGallery(root){installGallery(root);}
