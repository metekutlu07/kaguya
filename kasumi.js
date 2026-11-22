// Preserve the original eight cutouts and UV registration. This material pass
// varies optical density within their silhouettes, without reshaping them.
export const isKasumi=name=>/^0[1-8]-.*\.png$/.test(name);
const densities=[.72,.64,.75,.73,.67,.86,.80,.66];
export const kasumiOpacity=name=>isKasumi(name)?densities[Number(name.slice(0,2))-1]:1;
const hash=(x,y,s)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295};
const mix=(a,b,t)=>a+(b-a)*t;
function noise(x,y,s){const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);return mix(mix(hash(ix,iy,s),hash(ix+1,iy,s),u),mix(hash(ix,iy+1,s),hash(ix+1,iy+1,s),u),v)}
export function kasumiMaterial(img,name){
 const c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;
 const ctx=c.getContext('2d',{willReadFrequently:true}),w=c.width,h=c.height,s=Number(name.slice(0,2));
 // Only a subpixel feather at the contour. Original image remains immutable.
 ctx.drawImage(img,0,0);
 const im=ctx.getImageData(0,0,w,h),p=im.data;
 const alpha=new Uint8Array(w*h);let left=w,right=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;alpha[k]=p[k*4+3];if(alpha[k]>12){left=Math.min(left,x);right=Math.max(right,x)}}
 const extent=Math.max(1,right-left),fromRight=[2,3,4,6].includes(s);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(p[i+3]===0)continue;
  const k=y*w+x,a=alpha[k],u=Math.max(0,Math.min(1,(x-left)/extent)),v=fromRight?1-u:u;
  const cloud=noise(x/86,y/32,s),warp=noise(x/44,y/26,s+21),fibre=noise(x/7.5+warp*3,y/2.3+warp*4,s+13),grain=hash(x,y,s+79);
  const marble=1-Math.abs(2*noise(x/19+warp*2,y/11+warp*2,s+37)-1);
  const fade=1-.43*Math.pow(v,2.5),illumination=s===6?.13:s===8?.10:s===7?.06:.025;
  const near=Math.min(alpha[y*w+Math.max(0,x-2)],alpha[y*w+Math.min(w-1,x+2)],alpha[Math.max(0,y-2)*w+x],alpha[Math.min(h-1,y+2)*w+x]);
  const rim=Math.max(0,(a-near)/255)*(.50+.50*cloud);
  const optical=(.64+.31*cloud+.14*marble+.13*(fibre-.5)+.07*(grain-.5))*fade;
  const tint=1+illumination+.13*(cloud-.5)+.22*(fibre-.5)+.15*(marble-.5)+.065*(grain-.5);
  // A silver-blue fibre-lit contour, never an opaque white stroke.
  p[i]=Math.min(255,p[i]*tint+rim*35);p[i+1]=Math.min(255,p[i+1]*(tint+.035)+rim*48);p[i+2]=Math.min(255,p[i+2]*(tint+.075)+rim*60);p[i+3]=Math.round(Math.min(255,a*(optical+rim*.24)));
 }
 ctx.putImageData(im,0,0);return c;
}
