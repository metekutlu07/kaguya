// Advected random height fields: their analytic gradients supply the normals.
export const waterNormalGLSL=`
float waterHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 waterGradient(vec2 p){
 vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f),du=6.0*f*(1.0-f);
 float a=waterHash(i),b=waterHash(i+vec2(1,0)),c=waterHash(i+vec2(0,1)),d=waterHash(i+vec2(1,1));
 return vec2(mix(b-a,d-c,u.y)*du.x,mix(c-a,d-b,u.x)*du.y);
}
vec2 pondNormal(vec2 screen,float depth,float t){
 vec2 q=vec2((screen.x-.5)*(12.0+8.0/(.35+depth)),48.0*log(1.0+depth*9.0));
 vec2 a=waterGradient(q+vec2(t*.24,t*.49));
 vec2 b=waterGradient(q*vec2(1.83,1.57)+vec2(17.4-t*.38,8.2+t*.26));
 vec2 c=waterGradient(q*vec2(3.7,2.9)+vec2(38.1+t*.61,23.2-t*.44));
 return (a*.56+b*.30+c*.14)*vec2(.078,.14);
}
`;
export const portraitWaterGLSL=`
vec2 screen=gl_FragCoord.xy/viewportSize;
float depth=clamp((.365-screen.y)/.365,0.0,1.0);
float vis=smoothstep(.005,.075,depth);
vec2 slope=pondNormal(screen,depth,time*1.45)*vis;
vec2 sampleUV=vUv.xy/vUv.w;
sampleUV+=slope*vec2(.38,.075)*(0.12+depth*1.2);
sampleUV.y+=depth*.012;
float smear=.0006+depth*.008;
vec2 suv=clamp(sampleUV,vec2(.001),vec2(.999));
vec3 reflection=texture2D(tDiffuse,suv).rgb*.72;
reflection+=texture2D(tDiffuse,clamp(suv+vec2(smear,0.0),vec2(.001),vec2(.999))).rgb*.14;
reflection+=texture2D(tDiffuse,clamp(suv-vec2(smear,0.0),vec2(.001),vec2(.999))).rgb*.14;
float reflectance=(.95-.73*pow(depth,1.05))*(.92+.08*clamp(slope.y*9.0,-1.0,1.0));
base.rgb=mix(vec3(.020,.044,.081),reflection,reflectance);
base.rgb+=vec3(.040,.069,.105)*dot(slope,vec2(.3,-.7))*1.35;
// A narrow angular window of moonlight, reflecting from the same normals.
float lateral=screen.x-moonX;
float width=.025+depth*.072;
float column=exp(-pow(lateral/width,2.0));
float aligned=exp(-pow((slope.y-.041)/.021,2.0)-pow((slope.x+lateral*.60)/.042,2.0));
float moonlight=column*(.012+aligned*.82)*vis*(1.0-depth*.45);
base.rgb+=vec3(.76,.84,.96)*moonlight;
`;
const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295};
const lerp=(a,b,t)=>a+(b-a)*t;
function gradient(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return [lerp(b-a,d-c,sy)*6*fx*(1-fx),lerp(c-a,d-b,sx)*6*fy*(1-fy)]}
export function pondNormal(u,z,time){time*=1.45;const x=(u-.5)*(12+8/(.35+z)),y=48*Math.log(1+z*9),a=gradient(x+time*.24,y+time*.49),b=gradient(x*1.83+17.4-time*.38,y*1.57+8.2+time*.26),c=gradient(x*3.7+38.1+time*.61,y*2.9+23.2-time*.44),v=Math.min(1,z*13);return [(a[0]*.56+b[0]*.30+c[0]*.14)*.078*v,(a[1]*.56+b[1]*.30+c[1]*.14)*.14*v]}
export function makeWaterRelief(){
 const canvas=document.createElement('canvas');canvas.width=224;canvas.height=240;const ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height),data=image.data;let last=-Infinity;
 return (t,moonX=.65)=>{if(t-last<44)return canvas;last=t;const time=t*.001,w=canvas.width,h=canvas.height;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const u=x/(w-1),z=y/(h-1),[nx,ny]=pondNormal(u,z,time),lateral=u-moonX,vis=Math.min(1,z*13),column=Math.exp(-Math.pow(lateral/(.025+z*.072),2));
   const aligned=Math.exp(-Math.pow((ny-.041)/.021,2)-Math.pow((nx+lateral*.60)/.042,2)),moon=column*(.012+.82*aligned)*vis*(1-z*.45),relief=(nx*.3-ny*.7)*.38,i=(y*w+x)*4;
   data[i]=moon>.015?194+61*Math.min(1,moon):relief>0?105:7;data[i+1]=moon>.015?214+41*Math.min(1,moon):relief>0?148:18;data[i+2]=moon>.015?241:relief>0?186:33;data[i+3]=Math.round(Math.min(.88,Math.abs(relief)+moon)*255);
  }
  ctx.putImageData(image,0,0);return canvas;
 };
}
