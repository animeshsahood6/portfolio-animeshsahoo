/* ============================================================
   PROJECTS — cover art + immersive overlay engine
   Content lives in the DOM (.project-sources) for SEO/a11y;
   the overlay is assembled from it at open time.
   ============================================================ */

const ORDER = ['website-design', 'scalable-ads', 'pitch-works', 'social-media', 'meta-ads', 'creative-lab'];

/* Challenge → Approach → Solution → Impact (qualitative, honest) */
const PROCESS = {
  'website-design': {
    challenge: 'Dense products and long stories competing for a visitor’s patience.',
    approach: 'Narrative-first information architecture — every scroll earns the next.',
    solution: 'Modular page systems: homepage, catalog, detail — specified down to the hover state.',
    impact: 'Sites that read as products, not brochures.',
  },
  'scalable-ads': {
    challenge: 'One message, dozens of canvases — from 970×250 to 320×50.',
    approach: 'Design the system, not the ad.',
    solution: 'Master motion keyframes engineered to collapse gracefully into every IAB size.',
    impact: 'A creative refresh takes hours, not weeks.',
  },
  'pitch-works': {
    challenge: 'Complex offers meeting short attention spans.',
    approach: 'Story architecture before slides — one idea per channel.',
    solution: 'Campaign narratives resolved across OOH, video, display, email and web.',
    impact: 'Stories that survive the room.',
  },
  'social-media': {
    challenge: 'Feeds punish sameness and reward consistency — both at once.',
    approach: 'Editorial systems over one-off posts.',
    solution: 'Carousels, collections and stories built from one visual grammar per brand.',
    impact: 'Recognisable at a glance, scalable by design.',
  },
  'meta-ads': {
    challenge: 'Three seconds to earn a stop.',
    approach: 'Hooks first — the number is the story.',
    solution: 'Concept variants delivered across 1:1 feed and 9:16 story formats.',
    impact: 'Creative that qualifies the audience before the click.',
  },
  'creative-lab': {
    challenge: 'Ideas move faster than traditional production allows.',
    approach: 'AI as a creative collaborator; taste as the filter.',
    solution: 'Render-to-film pipelines, OS concepts and dashboard explorations.',
    impact: 'Exploration at machine scale, judgement at human scale.',
  },
};

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
    img.onload = () => { div.style.backgroundImage = `url("${img.src}")`; };
    img.onerror = () => {
      div.style.background = FALLBACK_ART[slug] || FALLBACK_ART['creative-lab'];
      div.classList.add('cover--fallback');
    };
    img.src = `assets/covers/${slug}.jpg`;
    fig.appendChild(div);
  });
}

/* ---------------- Overlay engine ------------------------------ */
import { Sound } from './sound.js';

export function initProjectOverlay() {
  const overlay = document.getElementById('projectOverlay');
  const panel = document.getElementById('overlayPanel');
  const scroller = document.getElementById('overlayScroll');
  const closeBtn = document.getElementById('overlayClose');
  let lastFocused = null;
  let openSlug = null;

  const build = (slug) => {
    const src = document.getElementById(`src-${slug}`);
    if (!src) return null;
    const d = src.dataset;
    const lede = src.querySelector('[data-lede]')?.textContent ?? '';
    const blocks = [...src.querySelectorAll('[data-block]')];
    const coverEl = document.querySelector(`[data-cover="${slug}"] .cover`);
    const coverStyle = coverEl?.style.backgroundImage
      ? `background-image:${coverEl.style.backgroundImage}`
      : `background:${FALLBACK_ART[slug]}`;

    const nextSlug = ORDER[(ORDER.indexOf(slug) + 1) % ORDER.length];
    const nextTitle = document.getElementById(`src-${nextSlug}`)?.dataset.title ?? '';

    const el = document.createElement('article');
    el.innerHTML = `
      <header class="p-hero">
        <div class="cover" style="${coverStyle}"></div>
        <div class="p-hero__text">
          <span class="tag tag--accent">${d.tag}</span>
          <h2 id="overlayTitle">${d.title}</h2>
          <p class="lede">${lede}</p>
        </div>
      </header>
      <dl class="p-meta">
        <div><dt>Role</dt><dd>${d.role}</dd></div>
        <div><dt>Tools</dt><dd>${d.tools}</dd></div>
        <div><dt>Scope</dt><dd>${d.scope}</dd></div>
      </dl>
      ${PROCESS[slug] ? `
      <dl class="p-process">
        ${Object.entries(PROCESS[slug]).map(([k, v], i) => `
          <div style="--i:${i}"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>` : ''}
      <div class="p-blocks">
        ${blocks.map((b, i) => `
          <section class="p-block" style="--i:${i + 4}">
            <p class="overline">0${i + 1}</p>
            <h3>${b.dataset.block}</h3>
            ${b.innerHTML}
          </section>`).join('')}
      </div>
      <button class="p-next" data-next="${nextSlug}">
        <span><span class="overline">Next project</span><br><strong>${nextTitle}</strong></span>
        <span class="work-card__arrow">→</span>
      </button>`;
    return el;
  };

  const open = (slug, fromEl) => {
    const article = build(slug);
    if (!article) return;
    openSlug = slug;
    lastFocused = fromEl ?? document.activeElement;
    scroller.replaceChildren(article);
    scroller.scrollTop = 0;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('nav-locked');
    closeBtn.focus({ preventScroll: true });
    Sound.play('open');

    article.querySelector('.p-next')?.addEventListener('click', (e) => {
      transitionTo(e.currentTarget.dataset.next);
    });
  };

  const transitionTo = (slug) => {
    panel.style.transition = 'opacity 250ms var(--ease-inout), transform 250ms var(--ease-inout)';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(24px) scale(0.985)';
    setTimeout(() => {
      const article = build(slug);
      if (article) {
        openSlug = slug;
        scroller.replaceChildren(article);
        scroller.scrollTop = 0;
        article.querySelector('.p-next')?.addEventListener('click', (e) => {
          transitionTo(e.currentTarget.dataset.next);
        });
      }
      panel.style.opacity = '';
      panel.style.transform = '';
      setTimeout(() => { panel.style.transition = ''; }, 300);
    }, 260);
  };

  const close = () => {
    Sound.play('close');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('nav-locked');
    openSlug = null;
    lastFocused?.focus({ preventScroll: true });
  };

  // Triggers — cards
  document.querySelectorAll('.work-card[data-project]').forEach((card) => {
    const slug = card.dataset.project;
    card.addEventListener('click', () => open(slug, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(slug, card); }
    });
  });

  // Triggers — links (the "Lab" nav item opens the Creative Lab case study)
  document.querySelectorAll('[data-open-project]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      open(link.dataset.openProject, link);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.querySelector('[data-overlay-close]').addEventListener('click', close);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openSlug) close();
    // Focus trap
    if (e.key === 'Tab' && openSlug) {
      const focusables = overlay.querySelectorAll('button, a[href]');
      const list = [...focusables].filter((f) => f.offsetParent !== null);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
