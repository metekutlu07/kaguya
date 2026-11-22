// Five encounters on one continuous rail. All transitions are reversible.
import {language,getCopy,englishChapters} from './language.js';
import {updateArc} from './arc.js';
export const chapters=[
 {name:'燕子安贝',emotion:'安宁',text:'燕巢中的贝壳，寄托着安宁的祈愿。它托举着辉夜姬，也托举着我心中那一点想要安定下来的愿望。'},
 {name:'火鼠裘',emotion:'庇护',text:'传说中火不能伤的神裘，化作一条柔软的空调毯。疲惫与焦虑时，把自己整个包进去，暂时与外界隔绝。'},
 {name:'蓬莱玉枝',emotion:'热忱',text:'那枝难以企及的玉枝，是我愿意跨山越海去见的人。手中的应援棒，承载着我向所爱之物奔赴的满腔热忱。'},
 {name:'佛之石钵',emotion:'欢愉',text:'佛前石钵盛放修行者的食粮，化作今日的游戏手柄。游戏是独属于我自己的精神食粮，是不必与他人分享的快乐。'},
 {name:'龙首五色玉',emotion:'欲望',text:'深海中的五色宝玉，化作一只欲望宝箱怪。吊牌、小票、充值凭证，如藤壶般附着在它身上。欲望不断堆积，越积越重。'}
];
const clamp=x=>Math.min(1,Math.max(0,x));
export const smooth=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
export const journeyDistance=4.6;
const openingLength=.56,celestialLength=.85,originalLength=4.14+openingLength;
export const journeyLength=originalLength+celestialLength+.47;
// Mandatory empty beats, expressed in raw rail coordinates.
export const openingPauses=[{at:.20/journeyLength,ms:250},{at:.60/journeyLength,ms:180},{at:(celestialLength+.48)/journeyLength,ms:350}];
export const treasureMarkers=Array.from({length:5},(_,i)=>(celestialLength+openingLength+i*.72)/journeyLength);
export function displayProgress(p){const stops=[0,...treasureMarkers,1];let n=0;while(n<5&&p>stops[n+1])n++;return (n+clamp((p-stops[n])/(stops[n+1]-stops[n])))/6;}
const spacing=.72;
export function chapterState(p){
 const total=p*journeyLength,raw=total-celestialLength,t=raw-openingLength,index=Math.max(0,Math.min(chapters.length-1,Math.floor((t+.17)/spacing))),local=t-index*spacing;
 const arrival=index===0?smooth(raw,.495,openingLength):smooth(local,-.08,.01),exit=1-smooth(local,.36,index===chapters.length-1?.49:.46);
 const moonApproach=index===chapters.length-1?smooth(local,.46,1.02):0,ending=index===chapters.length-1?smooth(local,.89,1.13):0;
 let travel=-journeyDistance*(1-smooth(raw,.36,openingLength));for(let i=0;i<chapters.length-1;i++)travel+=journeyDistance*smooth(t,i*spacing+.46,i*spacing+.68);
 travel+=12*moonApproach;
 const lunarZoom=smooth(raw,originalLength+.02,originalLength+.40),white=smooth(raw,originalLength+.065,originalLength+.29),collection=smooth(raw,originalLength+.29,originalLength+.45);
 return {index,travel,turn:smooth(local,.015,.17),object:(index===0?smooth(raw,.44,openingLength):arrival)*exit,title:arrival*exit,text:smooth(local,.17,.26)*exit,opening:Math.max(1-smooth(total,.075,.20),smooth(raw,.19,.26)*(1-smooth(raw,.39,.465))),openingTitle:total<.20?1:0,openingStory:total>=celestialLength?1:0,moonApproach,lunarZoom,ending:ending*(1-smooth(raw,originalLength,originalLength+.13)),progress:p,raw,celestial:1-smooth(total,.68,.85),coverTitle:1-smooth(total,.075,.20),celestialMoon:smooth(total,.20,.34),coverClouds:1-smooth(total,.12,.22),storyClouds:smooth(total,.24,.33),myth:smooth(total,.27,.35)*(1-smooth(total,.48,.59)),meteor:smooth(total,.59,.64)*(1-smooth(total,.80,.85)),descent:smooth(total,.61,.85),white,collection};
}
export function groveState(p,index){const raw=p*journeyLength-celestialLength,t=raw-openingLength,stage=Math.min(chapters.length-2,Math.max(0,Math.floor((t-.36)/spacing+1e-8))),q=t-stage*spacing,delay=index*.015,reveal=smooth(raw,-.10+index*.048,.025+index*.048);return {old:reveal*(1-smooth(q,.44+delay,.52+delay)),new:smooth(q,.55+delay,.65+delay),stage,reveal}}
export function entranceSide(name){return /left|bamboo-0[13]/.test(name)?-1:/right|bamboo-0[24]/.test(name)?1:0;}
export function updateChapterCopy(state){const copy=document.querySelector('.copy'),chapter=(language==='en'?englishChapters:chapters)[state.index],s=getCopy();if(copy.dataset.chapter!==chapter.name){copy.dataset.chapter=chapter.name;copy.querySelector('h1').textContent=chapter.name;copy.querySelector('h2').textContent=chapter.emotion;copy.querySelector('p').textContent=chapter.text;}copy.style.opacity=state.title;const chrome=smooth(state.raw,.495,openingLength);const narrative=copy.querySelector('p');narrative.style.opacity=state.text;copy.style.setProperty('--narrative',state.text);const opening=document.querySelector('.opening');if(opening){opening.style.opacity=state.opening;for(const [selector,opacity] of [['.opening-title',state.openingTitle],['.opening-story',state.openingStory]]){const el=opening.querySelector(selector);el.style.opacity=opacity;el.setAttribute('aria-hidden',opacity<.01?'true':'false');}opening.setAttribute('aria-hidden',state.opening<.01?'true':'false');}const ending=document.querySelector('.ending');if(ending){ending.style.opacity=state.ending;ending.setAttribute('aria-hidden',state.ending<.01?'true':'false');const restart=ending.querySelector('button');restart.disabled=state.ending<.95&&state.collection<.96;restart.style.pointerEvents=state.ending>.95?'auto':'none';}document.querySelector('.title').style.opacity=.75*chrome*(1-state.moonApproach);document.querySelector('.signature').style.opacity=.6*chrome*(1-state.moonApproach);document.querySelector('.note').style.opacity=.65*chrome*(1-state.moonApproach);document.querySelector('.note').textContent=state.opening>.1?s.startHint:state.ending>.1?s.moon:state.moonApproach>0?s.moon:s.explore;updateArc(state);}
