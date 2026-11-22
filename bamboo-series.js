// The original four paintings are Option 1; the new portrait paintings are
// Option 2. Keep both sets available without overwriting any source texture.
export const bambooOption=new URLSearchParams(location.search).get('bamboo')==='1'?1:2;
export const isBamboo=name=>/^bamboo-0[1-4]\.png$/.test(name);
export const bambooPath=name=>bambooOption===2&&isBamboo(name)?'bamboo-option-2/'+name:name;
// Atmospheric perspective is a presentation property, not a change to the painting.
export const bambooTone=name=>bambooOption===2?({
 'bamboo-01.png':{color:0x92a4b9,brightness:.58,opacity:1},
 'bamboo-02.png':{color:0xb8c5d7,brightness:.76,opacity:1},
 'bamboo-03.png':{color:0xa3b4c8,brightness:.68,opacity:.68},
 'bamboo-04.png':{color:0xa3b4c8,brightness:.68,opacity:.52}
}[name]):null;
export const option2LeftParts=[
 {name:'left-canopy',crop:[0,0,1024,395],rect:(W,H)=>({x:-W*.035,y:-H*.045,w:W*.70,h:W*.70*395/1024})},
 {name:'left-foliage',crop:[0,396,1024,1140],rect:(W,H)=>({x:-W*.02,y:H*.54,w:W*.65,h:W*.65*1140/1024})}
];
export function option2Rect(name,W,H,mobile){
 const box=(h,x,y)=>({x,y,w:h*2/3,h});
 if(mobile){
  switch(name){
   case 'bamboo-01.png':return box(H*1.03,-W*.02,-H*.015);
   case 'bamboo-02.png':{let h=H*.69;return box(h,W*1.155-h*2/3,-H*.025)}
   case 'bamboo-03.png':return box(H*.60,-W*.10,H*.035);
   case 'bamboo-04.png':{let h=H*.59;return box(h,W*1.015-h*2/3,H*.075)}
  }
 }else{
  switch(name){
   case 'bamboo-01.png':return box(H*1.04,-W*.012,-H*.015);
   case 'bamboo-02.png':{let h=H*.68;return box(h,W*1.015-h*2/3,-H*.025)}
   case 'bamboo-03.png':return box(H*.68,W*.30,-H*.035);
   case 'bamboo-04.png':{let h=H*.57;return box(h,W*.96-h*2/3,H*.08)}
  }
 }
}
