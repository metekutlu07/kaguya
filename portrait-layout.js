// Rectangles are computed from the visible alpha bounds of the original assets.
// Coordinates refer to the portrait viewport; the source texture stays unmodified.
export function isPortrait(w,h){return w<700 && h>w;}
const bounds={
 'bamboo-01.png':[1536,864,0,0,535,864], 'bamboo-02.png':[1536,864,1277,0,259,575],
 'bamboo-03.png':[1536,864,407,0,505,554], 'bamboo-04.png':[1536,864,1172,89,300,447],
 '01-front-left.png':[1672,941,0,747,793,91], '02-front-right.png':[1672,941,1351,841,321,20],
 '03-low-right.png':[1672,941,1339,642,333,76], '04-middle-right.png':[1672,941,1199,413,473,97],
 '05-middle-left.png':[1672,941,266,471,606,70], '06-upper-right.png':[1672,941,1210,201,462,71],
 '07-upper-left.png':[1672,941,0,109,876,144], '08-distant-sky.png':[1672,941,778,150,477,21],
 'moon.png':[1254,1254,136,145,963,985], 'swallows-cowrie-storyboard.png':[1373,1145,178,49,1057,1047]
};
export function portraitRect(name,W,H){
 const map={
  'bamboo-01.png':{h:H*.94,x:-W*.20,y:-H*.025},
  'bamboo-02.png':{h:H*.68,right:W*1.10,y:-H*.018},
  'bamboo-03.png':{w:W*.78,right:W*.58,y:H*.12},
  'bamboo-04.png':{w:W*.54,right:W*.99,y:H*.23},
  '01-front-left.png':{w:W*.63,right:W*.48,y:H*.82},
  '02-front-right.png':{w:W*.48,x:W*.64,y:H*.92},
  '03-low-right.png':{w:W*.52,x:W*.72,y:H*.75},
  '04-middle-right.png':{w:W*.70,x:W*.72,y:H*.52},
  '05-middle-left.png':{w:W*.73,right:W*.47,y:H*.42},
  '06-upper-right.png':{w:W*.60,x:W*.69,y:H*.30},
  '07-upper-left.png':{w:W*.82,right:W*.60,y:H*.075},
  '08-distant-sky.png':{w:W*.62,x:W*.30,y:H*.205},
  'moon.png':{w:W*.352,right:W*.826,y:H*.060},
  'swallows-cowrie-storyboard.png':{w:W*.624,right:W*.812,bottom:H*.65}
 };
 if(name==='indigo-background.png')return {x:-W*.12,y:-H*.1,w:W*1.24,h:H*1.2};
 if(name==='moon-haze.png')return {x:-W*.03,y:H*.055,w:W*1.14,h:H*.88};
 if(name==='forest-haze.png'||name==='water-haze.png')return {x:-W*.08,y:0,w:W*1.16,h:H};
 const b=bounds[name],t=map[name];if(!b||!t)return {x:0,y:0,w:W,h:H};
 const [iw,ih,bx,by,bw,bh]=b,s=t.w?t.w/bw:t.h/bh;
 const sy=/^0[1-8]-/.test(name)?s*.82:s;
 const x=t.x??t.right-bw*s,y=t.y??t.bottom-bh*sy;
 return {x:x-bx*s,y:y-by*sy,w:iw*s,h:ih*sy};
}
// One original foreground painting, with its two disconnected foliage clusters
// independently framed for portrait. Source UVs preserve their original proportions.
export const leftBambooParts=[
 {name:'left-canopy',crop:[0,0,550,130],rect:(W,H)=>({x:-W*.025,y:-H*.009,w:W*.85,h:W*.85*130/550})},
 {name:'left-foliage',crop:[0,340,425,524],rect:(W,H)=>({x:-W*.025,y:H*.49,w:W*.65,h:W*.65*524/425})}
];
