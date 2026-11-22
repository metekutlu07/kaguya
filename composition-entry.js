const view=document.querySelector('#view');
await import('./composition.js').catch(()=>{view.innerHTML='';document.querySelector('.copy').style.display='';return import('./composition-fallback.js')});
await new Promise(resolve=>requestAnimationFrame(resolve));
