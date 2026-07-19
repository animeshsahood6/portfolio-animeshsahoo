/* ============================================================
   NAV — hide on scroll down, glass state, active section,
   drawer, scroll progress, preloader choreography
   ============================================================ */

export function initNav() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  let lastY = scrollY;
  let velocity = 0;
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const dy = y - lastY;
      // Smoothed velocity: the nav reacts to intent, not jitter
      velocity = velocity * 0.8 + dy * 0.2;
      nav.classList.toggle('is-scrolled', y > 40);
      const hide = velocity > 4 && y > 160 && !document.body.classList.contains('nav-locked');
      const show = velocity < -2 || y <= 160;
      if (hide) nav.classList.add('is-hidden');
      else if (show) nav.classList.remove('is-hidden');
      lastY = y;

      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active section highlighting
  const links = [...document.querySelectorAll('[data-nav-link]')];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => io.observe(s));

  // Mobile drawer
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  const setDrawer = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setDrawer(toggle.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
}

/* --- Sliding active/hover indicator (spring) -------------------- */
export function initNavIndicator() {
  const wrap = document.querySelector('.nav__links');
  if (!wrap) return;
  const links = [...wrap.querySelectorAll('a')];
  if (!links.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'nav__indicator';
  indicator.setAttribute('aria-hidden', 'true');
  wrap.appendChild(indicator);

  let hovering = false;
  const activeLink = () => wrap.querySelector('a.is-active');
  const moveTo = (link) => {
    if (!link) { indicator.style.opacity = '0'; return; }
    indicator.style.opacity = '1';
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };
  const settle = () => moveTo(activeLink());

  links.forEach((l) => l.addEventListener('mouseenter', () => { hovering = true; moveTo(l); }));
  wrap.addEventListener('mouseleave', () => { hovering = false; settle(); });

  // follow the scroll-driven active state on the landing page
  const mo = new MutationObserver(() => { if (!hovering) settle(); });
  links.forEach((l) => mo.observe(l, { attributes: true, attributeFilter: ['class'] }));

  addEventListener('resize', () => { if (!hovering) settle(); });
  requestAnimationFrame(settle);
  setTimeout(settle, 400);          // after fonts settle
}

/* --- Preloader: quick, honest, then reveal --------------------- */
export function initPreloader(done) {
  const bar = document.getElementById('preloaderBar');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(0.9, p + Math.random() * 0.22);
    bar.style.transform = `scaleX(${p})`;
  }, 120);

  const finish = () => {
    clearInterval(tick);
    bar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      document.body.classList.add('is-loaded');
      document.body.removeAttribute('data-loading');
      done?.();
    }, 320);
  };

  if (document.readyState === 'complete') finish();
  else addEventListener('load', finish, { once: true });
  // Hard cap — never hold the page hostage
  setTimeout(finish, 2600);
}
