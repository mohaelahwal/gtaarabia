const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function renderPinnedVideo(videos) {
  const video = videos.find(item => item.pinned === true && /^[\w-]{11}$/.test(item.id));
  if (!video) return '';
  const title = escapeHTML(video.title);
  return `<section class="pinned-video" aria-label="الفيديو المثبت">
    <div class="pinned-video-heading"><div><span class="eyebrow">بث وتختيم · مثبّت</span><h2>${title}</h2><p>${escapeHTML(video.publisher)}</p></div><a class="outline" href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">شاهد على يوتيوب ↗</a></div>
    <div class="pinned-video-player"><iframe title="${title}" src="https://www.youtube.com/embed/${video.id}?autoplay=1&amp;mute=0&amp;playsinline=1&amp;rel=0&amp;hl=ar" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <p class="media-note">الصوت مفعّل. إذا لم يبدأ الفيديو تلقائياً، اضغط تشغيل داخل المشغّل. قد يتضمن الفيديو أحداثاً من القصة.</p>
  </section>`;
}
