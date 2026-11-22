// Don't cache large 3D files or private responses. Keep the current release fresh.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }, {once: true});
}

// Install promotion belongs to the welcome screen, never the journey itself.
const gate = document.querySelector('.language-gate');
if (gate) {
  const standalone = matchMedia('(display-mode: standalone)');
  const fullscreen = matchMedia('(display-mode: fullscreen)');
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferredPrompt = null, installed = false;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'get-app';
  button.hidden = true;
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 7v8m-4-4h8"/></svg><span></span>';
  const enter = gate.querySelector('.enter');
  const entryActions = document.createElement('div');
  entryActions.className = 'entry-actions';
  enter.before(entryActions);
  entryActions.append(enter, button);
  const dialog = document.createElement('dialog');
  dialog.className = 'install-guide';
  dialog.setAttribute('aria-labelledby', 'install-guide-title');
  dialog.innerHTML = '<img src="kaguya-pearl-icon-192.png" alt="" width="56" height="56"><h2 id="install-guide-title"></h2><ol></ol><button type="button" class="install-close"></button>';
  document.body.append(dialog);
  const en = () => gate.querySelector('input[name="language"]:checked')?.value === 'en';
  function localize() {
    button.querySelector('span').textContent = en() ? 'Get the app' : '安装应用';
    dialog.lang = en() ? 'en' : 'zh-CN';
    dialog.querySelector('h2').textContent = en() ? 'Add Kaguya to your home screen' : '将辉夜添加到主屏幕';
    dialog.querySelector('.install-close').textContent = en() ? 'Close' : '关闭';
    const steps = ios ? (en() ? ['Open this page in Safari.', 'Tap the Share icon (square with an upward arrow).', 'Choose Add to Home Screen, then Add.'] : ['在 Safari 浏览器中打开此网页。','点击分享图标（带向上箭头的方框）。','选择“添加到主屏幕”，然后点击“添加”。']) : (en() ? ['Open your browser menu.', 'Choose Install app or Add to Home screen.', 'Confirm to add Kaguya.'] : ['打开浏览器菜单。','选择“安装应用”或“添加到主屏幕”。','确认添加辉夜。']);
    const list = dialog.querySelector('ol');
    list.replaceChildren(...steps.map(step => { const li = document.createElement('li'); li.textContent = step; return li; }));
    if (ios) list.children[1].insertAdjacentHTML('beforeend',' <svg class="install-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V2m-4 4 4-4 4 4M8 9H5v13h14V9h-3"/></svg>');
  }
  function refresh() {
    button.hidden = installed || standalone.matches || fullscreen.matches || navigator.standalone === true;
    if (button.hidden && dialog.open) dialog.close();
  }
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; refresh(); });
  window.addEventListener('appinstalled', () => { installed = true; deferredPrompt = null; refresh(); });
  standalone.addEventListener?.('change', refresh);
  fullscreen.addEventListener?.('change', refresh);
  gate.addEventListener('change', localize);
  button.addEventListener('click', async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      deferredPrompt = null;
      try { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') installed = true; refresh(); return; } catch {}
    }
    localize();
    dialog.showModal();
  });
  dialog.querySelector('.install-close').addEventListener('click', () => dialog.close());
  localize(); refresh();
  // language-entry may read a language from the URL after the deferred script.
  window.addEventListener('load', localize, {once:true});
}
