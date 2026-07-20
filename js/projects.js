/* ============================================================
   PROJECTS — work-card cover art.
   Case studies live on their own pages; cards link to them.
   ============================================================ */

/* Cover art: real image if present in assets/covers, else a
   handcrafted gradient composition in the portfolio palette. */
const FALLBACK_ART = {
  'website-design': 'radial-gradient(120% 90% at 18% 12%, rgba(106,165,255,0.28), transparent 55%), radial-gradient(90% 70% at 85% 90%, rgba(61,123,255,0.18), transparent 60%), #161616',
  'scalable-ads':   'radial-gradient(110% 80% at 80% 15%, rgba(255,120,60,0.16), transparent 55%), radial-gradient(80% 70% at 15% 85%, rgba(106,165,255,0.14), transparent 60%), #141414',
  'pitch-works':    'radial-gradient(120% 90% at 50% 100%, rgba(120,200,255,0.16), transparent 55%), radial-gradient(70% 60% at 85% 10%, rgba(255,255,255,0.05), transparent 60%), #151617',
  'social-media':   'radial-gradient(110% 80% at 20% 85%, rgba(255,190,80,0.14), transparent 55%), radial-gradient(80% 70% at 80% 15%, rgba(106,165,255,0.16), transparent 60%), #141414',
  'meta-ads':       'radial-gradient(120% 90% at 82% 80%, rgba(90,220,170,0.13), transparent 55%), radial-gradient(80% 70% at 12% 12%, rgba(106,165,255,0.16), transparent 60%), #131414',
  'creative-lab':   'radial-gradient(120% 100% at 50% 115%, rgba(106,165,255,0.3), transparent 60%), radial-gradient(60% 50% at 82% 8%, rgba(200,120,255,0.12), transparent 60%), #0F1014',
};

export function initCovers() {
  document.querySelectorAll('[data-cover]').forEach((fig) => {
    const slug = fig.dataset.cover;
    const div = document.createElement('div');
    div.className = 'cover';
    const img = new Image();
    // decode() before showing: the fade-in starts on a fully
    // rasterised image, never a half-decoded pop
    img.onload = () => {
      const show = () => {
        div.style.backgroundImage = `url("${img.src}")`;
        div.classList.add('is-ready');
      };
      img.decode ? img.decode().then(show, show) : show();
    };
    img.onerror = () => {
      div.style.background = FALLBACK_ART[slug] || FALLBACK_ART['creative-lab'];
      div.classList.add('cover--fallback', 'is-ready');
    };
    img.src = `assets/covers/${slug}.jpg`;
    fig.appendChild(div);
  });
}
