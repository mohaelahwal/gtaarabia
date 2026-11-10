/* GA4: one page view per document. Site navigation loads full documents. */
(() => {
  if (window.gtaArabiaAnalytics) return;
  const ID = 'G-H98QKYG0QX';
  const KEY = 'gta-arabia-analytics-consent-v1';
  const enabledHost = ['www.gtaarabia.com', 'gtaarabia.com'].includes(location.hostname);
  let accepted = false, started = false, banner;
  const states = new WeakMap();
  const readChoice = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const page = () => location.origin + location.pathname;
  const event = (name, params = {}) => {
    if (accepted && enabledHost) window.gtag('event', name, {send_to: ID, page_location: page(), ...params});
  };
  function start() {
    if (started || !enabledHost) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('consent', 'default', {analytics_storage:'granted', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', ID, {allow_google_signals:false, allow_ad_personalization_signals:false, page_location:page()});
    const script = document.createElement('script');
    script.async = true; script.id = 'gta-ga4-tag';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.append(script);
    const article = location.pathname.match(/^\/articles\/([a-z0-9-]+)\//);
    if (article) event('article_view', {article_id:article[1]});
  }
  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch {}
    accepted = value === 'accepted';
    banner?.remove();
    if (accepted) start();
    else if (started) {
      window['ga-disable-' + ID] = true;
      window.gtag('consent','update',{analytics_storage:'denied'});
      // Remove Analytics cookies when withdrawing consent.
      for (const part of document.cookie.split(';')) {
        const name = part.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', ';domain=' + location.hostname, ';domain=.gtaarabia.com'])
          document.cookie = name + '=;Max-Age=0;path=/' + domain;
      }
      location.reload();
    }
  }
  function preferences() {
    if (banner?.isConnected) return;
    const en = document.documentElement.lang === 'en';
    banner = document.createElement('section');
    banner.className = 'analytics-consent'; banner.setAttribute('aria-label', en?'Analytics preferences':'إعدادات إحصاءات الزيارات');
    banner.innerHTML = `<p>${en?'Allow Google Analytics to measure visits, article views and video interactions? Optional analytics cookies help us improve the site. Advertising personalization is disabled.':'هل تسمح باستخدام Google Analytics لقياس الزيارات وقراءة المقالات والتفاعل مع الفيديو؟ ملفات الإحصاءات اختيارية وتساعدنا على تحسين الموقع. تخصيص الإعلانات معطّل.'}</p><div><button type="button" data-analytics-accept>${en?'Accept analytics':'قبول الإحصاءات'}</button><button type="button" data-analytics-decline>${en?'Continue without analytics':'المتابعة دون إحصاءات'}</button></div>`;
    banner.querySelector('[data-analytics-accept]').onclick = () => choose('accepted');
    banner.querySelector('[data-analytics-decline]').onclick = () => choose('declined');
    document.body.append(banner);
  }
  window.gtaArabiaAnalytics = {preferences};
  const choice = readChoice();
  if (choice === 'accepted') { accepted = true; start(); }
  else if (choice !== 'declined') preferences();
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'analytics-settings';
  settings.textContent = document.documentElement.lang === 'en'?'Analytics preferences':'إعدادات إحصاءات الزيارات';
  settings.onclick = preferences;
  (document.querySelector('footer') || document.body).append(settings);
  document.addEventListener('click', e => {
    const button = e.target.closest?.('[data-subscribe],[data-donate],[data-share],[data-video]');
    if (!button) return;
    const action = ['subscribe','donate','share','video'].find(key => button.hasAttribute('data-' + key));
    event('cta_click', {button_id:action, ...(action === 'video'?{video_id:button.dataset.video}:{})});
  }, true);
  const videoInfo = v => ({video_title:v.getAttribute('aria-label') || 'فيديو GTA Arabia', video_url:new URL(v.currentSrc || v.querySelector('source')?.src || page(), page()).pathname, video_duration:Math.round(v.duration || 0)});
  const contentVideo = v => v?.tagName === 'VIDEO' && !v.classList.contains('hero-video');
  document.addEventListener('play', e => {
    const v = e.target; if (!contentVideo(v) || !accepted) return;
    const state = states.get(v) || new Set();
    if (!state.has('start')) { event('video_start', {...videoInfo(v),autoplay:v.autoplay}); state.add('start'); }
    states.set(v,state);
  }, true);
  document.addEventListener('timeupdate', e => {
    const v = e.target; if (!contentVideo(v) || !accepted || !Number.isFinite(v.duration) || v.duration <= 0) return;
    const state = states.get(v) || new Set();
    for (const percent of [25,50,75,90]) if (v.currentTime/v.duration*100 >= percent && !state.has(percent)) {
      event('video_progress', {...videoInfo(v),video_percent:percent}); state.add(percent);
    }
    states.set(v,state);
  }, true);
  document.addEventListener('ended', e => {
    if (contentVideo(e.target)) event('video_complete', videoInfo(e.target));
  }, true);
})();
