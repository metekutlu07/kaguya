import {bambooPath} from './bamboo-series.js';
const names=['indigo-background.png','moon.png','swallows-cowrie-storyboard.png',...Array.from({length:4},(_,i)=>`bamboo-0${i+1}.png`),'01-front-left.png','02-front-right.png','03-low-right.png','04-middle-right.png','05-middle-left.png','06-upper-right.png','07-upper-left.png','08-distant-sky.png'];
const pool=new Map();
export function sceneImage(name){
 if(pool.has(name))return pool.get(name);
 const im=new Image();im.src='assets/composition/'+bambooPath(name).replace(/\.png$/,'.webp');
 const ready=im.decode().catch(()=>{im.src='assets/composition/'+bambooPath(name);return im.decode()});
 const entry={im,ready};pool.set(name,entry);return entry;
}
export function preloadScene(){return Promise.all(names.map(name=>sceneImage(name).ready));}
