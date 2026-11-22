import {setLanguage} from './language.js';
import {installSound,setSoundLanguage,startSound} from './soundscape.js';
import {preloadScene} from './scene-assets.js';
const gate=document.querySelector('.language-gate'),journey=document.querySelector('#journey'),enter=gate.querySelector('.enter');
// Fullscreen needs a direct user gesture; place this control beside Sound.
const fullscreenButton=document.createElement('button');
const fullscreenLabel=document.createElement('span');fullscreenLabel.className='fullscreen-label';fullscreenLabel.id='fullscreen-label';
fullscreenButton.type='button';fullscreenButton.className='fullscreen-option';
fullscreenButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg><span></span>';
const desktopFullscreen=matchMedia('(min-width:700px) and (hover:hover) and (pointer:fine)');
const screenElement=document.documentElement;
const requestFull=screenElement.requestFullscreen||screenElement.webkitRequestFullscreen;
const exitFull=document.exitFullscreen||document.webkitExitFullscreen;
const isFull=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement);
function updateFullscreen(){
 const en=gate.querySelector('input:checked').value==='en',full=isFull();
 fullscreenButton.hidden=!desktopFullscreen.matches||!requestFull||!exitFull;fullscreenLabel.hidden=fullscreenButton.hidden;
 fullscreenLabel.textContent=en?'Full screen':'全屏';fullscreenButton.querySelector('span').textContent=en?(full?'On':'Off'):(full?'开启':'关闭');
 const label=en?(full?'Exit fullscreen':'Fullscreen'):(full?'退出全屏':'全屏模式');
 fullscreenButton.setAttribute('aria-label',label);fullscreenButton.title=label;
 fullscreenButton.querySelector('path').setAttribute('d',full?'M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5':'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5');
 fullscreenButton.setAttribute('aria-pressed',String(full));
}
fullscreenButton.addEventListener('click',async()=>{try{if(isFull())await exitFull.call(document);else await requestFull.call(screenElement);}catch(error){console.warn('Fullscreen unavailable',error);}updateFullscreen();});
document.addEventListener('fullscreenchange',updateFullscreen);
document.addEventListener('webkitfullscreenchange',updateFullscreen);
desktopFullscreen.addEventListener?.('change',updateFullscreen);
gate.querySelector('.sound-settings').append(fullscreenLabel,fullscreenButton);
function updateGate(){const en=gate.querySelector('input:checked').value==='en';gate.querySelector('legend').textContent=en?'Language':'选择语言';gate.setAttribute('aria-label',en?'Select language':'选择语言');enter.textContent=gate.classList.contains('is-loading')?(en?'Loading…':'加载中…'):(en?'Enter':'进入');gate.lang=en?'en':'zh-CN';setSoundLanguage(en);updateFullscreen();}
installSound(gate);gate.addEventListener('change',updateGate);if(new URLSearchParams(location.search).get('lang')==='en'||location.hash==='#treasures'&&sessionStorage.getItem('kaguya-language')==='en')gate.querySelector('input[value=en]').checked=true;updateGate();enter.disabled=false;
const fonts=Promise.allSettled([document.fonts.load('300 20px "Space Grotesk"'),document.fonts.load('400 20px "Noto Story Sans"','选择语言声音关闭进入中文'),document.fonts.load('400 24px Basteleur'),document.fonts.load('400 24px "Noto Story Serif"','辉夜五件宝物')]);
fonts.then(()=>gate.classList.add('fonts-ready'));
const mirrorPreload=new Image();mirrorPreload.src=desktopFullscreen.matches?'assets/composition/mirror-desktop-pearl-crest.webp':'assets/composition/mirror-overlay.png';mirrorPreload.decode?.().catch(()=>{});
const jewelPreload=new Image();jewelPreload.src='assets/composition/mirror-jewels-small.png';jewelPreload.decode?.().catch(()=>{});
const logoPreload=new Image();logoPreload.src='assets/composition/kaguya-console-logo.webp';logoPreload.decode?.().catch(()=>{});
const artwork=preloadScene();artwork.catch(()=>{});
// Keep the language controls independent of the heavier 3D module graph.
const arcReady=import('./arc.js');arcReady.catch(()=>{});
gate.addEventListener('submit',async e=>{
 e.preventDefault();if(enter.disabled)return;enter.disabled=true;enter.textContent=gate.lang==='en'?'Loading…':'加载中…';gate.classList.add('is-loading');gate.setAttribute('aria-busy','true');
 const entryURL=new URL(location.href);entryURL.hash='';entryURL.searchParams.delete('collection');history.replaceState(null,'',entryURL.pathname+entryURL.search);
 setLanguage(gate.querySelector('input:checked').value);sessionStorage.setItem('kaguya-language',gate.querySelector('input:checked').value);
 startSound();
 try{const {installArc,localizeArc}=await arcReady;installArc();localizeArc();await Promise.all([fonts,artwork]);await import('./composition-entry.js');const normal=!location.hash.includes('treasures')&&!new URLSearchParams(location.search).has('collection');if(normal)journey.classList.add('cinematic-arrival');journey.hidden=false;journey.inert=false;document.body.classList.add('entered');if(normal){gate.classList.add('gate-depart');await new Promise(resolve=>setTimeout(resolve,1200));}gate.hidden=true;}catch(error){enter.disabled=false;gate.classList.remove('is-loading');gate.removeAttribute('aria-busy');updateGate();console.warn('Could not prepare the opening scene',error);}
});
