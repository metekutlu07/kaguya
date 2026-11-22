// Slowly evolving procedural density fields, sampled at three independent
// spatial depths. Low resolution is intentional: fog is a soft medium.
export const isFog=name=>['moon-haze.png','forest-haze.png','water-haze.png'].includes(name);
const config={
 'celestial-haze.png':{seed:31,center:.38,spread:.18,strength:.78,scale:5.4,cloud:true},
 'moon-haze.png':{seed:17,center:.36,spread:.44,strength:.34,scale:3.2},
 'water-haze.png':{seed:57,center:.63,spread:.095,strength:.44,scale:4.0},
 'forest-haze.png':{seed:93,center:.50,spread:.35,strength:.40,scale:3.5}
};
function hash(x,y,z){let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(z,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295}
const mix=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=smooth(x-ix),fy=smooth(y-iy),fz=smooth(z-iz);const slice=k=>mix(mix(hash(ix,iy,k),hash(ix+1,iy,k),fx),mix(hash(ix,iy+1,k),hash(ix+1,iy+1,k),fx),fy);return mix(slice(iz),slice(iz+1),fz)}
export function makeFog(name){
 const a=config[name],canvas=document.createElement('canvas');canvas.width=144;canvas.height=112;
 const ctx=canvas.getContext('2d'),im=ctx.createImageData(canvas.width,canvas.height),pixels=im.data;let previous=-1;
 function update(time){const rate=innerWidth<700?4:7,phase=(a.seed%11)/11,tick=Math.floor(time*rate+phase);if(tick===previous)return false;previous=tick;const t=(tick-phase)/rate;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
   const u=x/(canvas.width-1),v=y/(canvas.height-1),q=a.scale,xx=u*q+t*.022,yy=v*q*1.9,zz=a.seed+t*.012;
   const n=.60*noise(xx,yy,zz)+.28*noise(xx*2.1,yy*2.1,zz+11)+.12*noise(xx*4.3,yy*4.3,zz+29);
   const envelope=Math.exp(-Math.pow((v-a.center)/a.spread,2)),moon=Math.exp(-((u-.65)**2/.105+(v-.20)**2/.16));
   let density=Math.max(0,(n-.25)*1.6),shape=envelope;const edge=Math.min(1,u*12,(1-u)*12,v*12,(1-v)*12);
   if(a.cloud){const ridge=.32+.13*Math.sin(u*5.4+t*.025)+.12*(noise(u*3.8+t*.014,1.8,zz)-.5),ridge2=.68+.055*Math.sin(u*6.2-t*.02),fine=.55*noise(xx*7,yy*7,zz+31)+.45*noise(xx*14,yy*14,zz+41);shape=Math.exp(-((v-ridge)**2)/.010)+.45*Math.exp(-((v-ridge2)**2)/.004);density=Math.max(0,(n-.32)*1.85)*(.65+.65*fine);}
   const i=(y*canvas.width+x)*4;pixels[i]=65+moon*73;pixels[i+1]=105+moon*61;pixels[i+2]=145+moon*50;pixels[i+3]=Math.round(255*Math.min(1,density*shape*edge*a.strength*(.75+moon*.45)));
  }
  ctx.putImageData(im,0,0);return true;
 }
 update(0);return {canvas,update};
}
export function installAtmosphereGrade(){
 const view=document.querySelector('#view'),grain=document.createElement('div'),tile=document.createElement('canvas');tile.width=tile.height=128;
 const ctx=tile.getContext('2d'),im=ctx.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){let g=hash(i,7,19)*255;im.data[i]=im.data[i+1]=im.data[i+2]=g;im.data[i+3]=255}ctx.putImageData(im,0,0);
 Object.assign(grain.style,{position:'fixed',inset:'0',pointerEvents:'none',backgroundImage:`url(${tile.toDataURL()})`,backgroundSize:'128px 128px',opacity:'.05',mixBlendMode:'soft-light'});view.after(grain);
 const vignette=document.querySelector('.vignette');if(vignette)vignette.style.background='radial-gradient(ellipse at 56% 42%,transparent 38%,rgba(3,12,23,.36) 83%,rgba(2,9,19,.58) 100%)';
}
// A bank-shaped, slowly drifting density field across the water's distant edge.
export function makeHorizonMist(){
 const canvas=document.createElement('canvas');canvas.width=220;canvas.height=48;
 const ctx=canvas.getContext('2d'),im=ctx.createImageData(canvas.width,canvas.height);let last=-1;
 function update(time){const tick=Math.floor(time*10);if(tick===last)return false;last=tick;const t=tick/10;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
   const u=x/(canvas.width-1),v=y/(canvas.height-1),a=noise(u*5+t*.035,v*1.4,7+t*.018),b=noise(u*11-t*.026,v*3.4,19+t*.022),n=a*.72+b*.28;
   const ridge=.48+(a-.5)*.14,veil=Math.exp(-(((v-ridge)/.235)**2)),core=Math.exp(-(((v-.5)/.075)**2)),edge=Math.sin(Math.PI*v)**1.4;
   const density=Math.min(.83,(.30+.55*n)*veil+.19*core)*edge,i=(y*canvas.width+x)*4,moon=Math.exp(-(((u-.65)/.28)**2));
   im.data[i]=61+moon*27;im.data[i+1]=96+moon*32;im.data[i+2]=128+moon*38;im.data[i+3]=Math.round(255*density);
  }ctx.putImageData(im,0,0);return true;
 }update(0);return {canvas,update};
}
