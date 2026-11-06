// Disabled by default. Enable only after AdSense approval and consent setup.
export function canServeAds(settings, consent) {
  return settings?.enabled === true && consent === true && /^ca-pub-\d{16}$/.test(settings.publisherId || '');
}
export function prepareAds(root, settings = {}) {
  const route = document.body.dataset.route || 'home';
  const positions = route === 'videos' ? ['contentBottom'] : ['contentTop', 'contentBottom'];
  for (const position of positions) {
    const slot = document.createElement('aside');
    slot.className = 'ad-placement'; slot.dataset.adPosition = position;
    slot.setAttribute('aria-label', 'إعلان'); slot.hidden = true;
    if (position === 'contentTop' && root.firstElementChild) root.firstElementChild.after(slot);
    else root.append(slot);
  }
  if (settings.enabled !== true) return; // No requests, script injection or empty spaces.
  let consent = false;
  const render = () => {
    if (!canServeAds(settings, consent)) return;
    const candidates = [...root.querySelectorAll('[data-ad-position]')].filter(el => /^\d+$/.test(settings.slots?.[el.dataset.adPosition] || '') && !el.dataset.initialized);
    if (!candidates.length) return;
    if (!document.getElementById('google-adsense-script')) {
      const script = document.createElement('script'); script.id = 'google-adsense-script';
      script.async = true; script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + settings.publisherId;
      script.onerror = () => root.querySelectorAll('.ad-placement').forEach(el => el.hidden = true);
      document.head.append(script);
    }
    for (const el of candidates) {
      el.dataset.initialized = 'true'; el.hidden = false;
      const label = document.createElement('small'); label.textContent = 'إعلان';
      const ins = document.createElement('ins'); ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.dataset.adClient = settings.publisherId; ins.dataset.adSlot = settings.slots[el.dataset.adPosition];
      ins.dataset.adFormat = 'auto'; ins.dataset.fullWidthResponsive = 'true';
      el.append(label, ins); (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  };
  // Call from the approved consent integration only after its consent callback.
  window.gtaArabiaAds = {
    grantConsent() { consent = true; render(); },
    revokeConsent() { consent = false; location.reload(); }
  };
}
