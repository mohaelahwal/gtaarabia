const platforms = [
  ['youtube', 'يوتيوب'],
  ['tiktok', 'تيك توك'],
  ['instagram', 'إنستغرام'],
  ['x', 'إكس'],
];

export function renderSocialLinks(profiles) {
  return platforms.map(([brand, label]) => {
    let url;
    try {
      url = new URL(profiles?.[brand]);
    } catch {
      return '';
    }
    if (url.protocol !== 'https:') return '';

    const href = url.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    return `<a class="social-link social-link--${brand}" href="${href}" aria-label="GTA Arabia على ${label}" target="_blank" rel="noopener noreferrer"><img src="assets/social/${brand}.svg" width="17" height="17" alt=""></a>`;
  }).join('');
}
