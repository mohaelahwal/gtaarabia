const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export function renderPinnedVideo(videos) {
  const video = videos.find(item => item.pinned === true && /^[\w-]{11}$/.test(item.id));
  if (!video) return '';
  const title = escapeHTML(video.title);
  return `<section class="pinned-video" aria-label="الفيديو المثبت">
    <div class="pinned-video-heading"><div><h2>${title}</h2><p>${escapeHTML(video.publisher)}</p></div><a class="outline" href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">يوتيوب ↗</a></div>
    <div class="pinned-video-player"><iframe title="${title}" src="https://www.youtube.com/embed/${video.id}?autoplay=1&amp;mute=0&amp;playsinline=1&amp;rel=0&amp;hl=ar" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><button type="button" class="pinned-video-fullscreen" data-stream-fullscreen>عرض بملء الشاشة ⛶</button></div>
    <p class="media-note">إذا لم يبدأ تلقائياً، افتح ملء الشاشة واضغط تشغيل. قد يتضمن الفيديو أحداثاً من القصة.</p>
  </section>`;
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', async event => {
    const button = event.target.closest?.('[data-stream-fullscreen]');
    if (!button) return;
    const player = button.closest('.pinned-video-player');
    if (document.fullscreenElement === player) {
      await document.exitFullscreen();
      return;
    }
    if (player.classList.contains('expanded')) {
      player.classList.remove('expanded');
      button.textContent = 'عرض بملء الشاشة ⛶';
      return;
    }
    try {
      await player.requestFullscreen();
    } catch {
      player.classList.add('expanded');
      button.textContent = 'إغلاق ملء الشاشة ×';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('[data-stream-fullscreen]').forEach(button => {
      button.textContent = document.fullscreenElement === button.closest('.pinned-video-player')
        ? 'إغلاق ملء الشاشة ×' : 'عرض بملء الشاشة ⛶';
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.pinned-video-player.expanded').forEach(player => {
      player.classList.remove('expanded');
      player.querySelector('[data-stream-fullscreen]').textContent = 'عرض بملء الشاشة ⛶';
    });
  });
}
