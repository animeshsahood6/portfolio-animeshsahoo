/* ============================================================
   ATMOSPHERE JS — count-up on the stat figures.
   Enhancement only: the final value is already in the DOM, so
   with JS off or reduced motion on, the numbers read correctly.
   ============================================================ */
import { reducedMotion, finePointer } from './motion.js';

export function initCountUp() {
  const nums = [...document.querySelectorAll('[data-count]')];
  if (!nums.length) return;

  if (reducedMotion) return;   // final values are already rendered

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    if (!Number.isFinite(target)) return;
    const dur = 1100;
    const start = performance.now();
    // Ease-out cubic — fast then settling
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(ease(t) * target) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  nums.forEach((el) => io.observe(el));
}

/* ============================================================
   ROTATING WORD — cycles the final word of the hero tagline.
   Masked vertical slide + a whisper of blur; the container width
   eases between word widths so the sentence never jumps hard.
   ============================================================ */
export function initWordRotator() {
  document.querySelectorAll('.rword').forEach(setupWordRotator);
}

function setupWordRotator(el) {
  const words = (el.dataset.rotate || el.textContent)
    .split(',').map((w) => w.trim()).filter(Boolean);
  if (!words.length) return;

  // Screen readers get one stable word instead of a 3-second ticker:
  // the animated span is decorative, a hidden sibling carries the text.
  el.setAttribute('aria-hidden', 'true');
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = words[0];
  el.after(sr);

  el.textContent = '';

  // hidden probe used to measure each word's rendered width
  const measure = document.createElement('span');
  measure.className = 'rword__measure';
  el.appendChild(measure);

  const widthOf = (w) => { measure.textContent = w; return measure.offsetWidth; };
  const setWidth = (w) => { el.style.width = widthOf(w) + 'px'; };

  // one word element that stays in normal flow — keeps the baseline
  // aligned with the surrounding text and avoids any stacking jitter
  const word = document.createElement('span');
  word.className = 'rword__w';
  word.textContent = words[0];
  el.appendChild(word);
  setWidth(words[0]);

  if (reducedMotion || words.length < 2) return;   // hold the first word

  let idx = 0;
  let busy = false;
  let inView = true;
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { inView = entry.isIntersecting; });
  }).observe(el);

  const cycle = () => {
    // don't churn text + reflow while nobody can see it
    if (busy || document.hidden || !inView) return;
    busy = true;
    const next = (idx + 1) % words.length;

    setWidth(words[next]);                          // container width eases now
    word.classList.add('rword__w--exit');          // fade + rise + soften out

    setTimeout(() => {
      // swap while invisible, drop below with NO transition…
      word.textContent = words[next];
      word.classList.remove('rword__w--exit');
      word.classList.add('rword__w--prime');
      void word.offsetWidth;                         // commit the primed state
      // …then release into place
      word.classList.remove('rword__w--prime');
      word.classList.add('rword__w--enter');
      setTimeout(() => { word.classList.remove('rword__w--enter'); busy = false; }, 620);
      idx = next;
    }, 380);
  };

  // start after the hero reveal has settled; slow, calm cadence
  setTimeout(() => setInterval(cycle, 3000), 1800);
}

/* ============================================================
   HERO PARALLAX — the haze and orbit drift a few px toward the
   pointer. Uses the `translate` property so it composes with the
   transform-based CSS animations instead of fighting them.
   ============================================================ */
export function initHeroParallax() {
  if (!finePointer || reducedMotion) return;
  setupParallax('.hero', '.hero__haze', '.hero__ring');
  setupParallax('.contact', '.contact__haze', '.contact__ring');
}

function setupParallax(rootSel, hazeSel, ringSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;
  const haze = root.querySelector(hazeSel);
  const ring = root.querySelector(ringSel);
  if (!haze && !ring) return;

  let tx = 0, ty = 0, x = 0, y = 0;
  root.addEventListener('mousemove', (e) => {
    const r = root.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1 … 1
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    // raw cursor position drives the soft spotlight
    root.style.setProperty('--sx', `${e.clientX - r.left}px`);
    root.style.setProperty('--sy', `${e.clientY - r.top}px`);
  }, { passive: true });
  root.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  let px = NaN, py = NaN;
  (function loop() {
    x += (tx - x) * 0.06;
    y += (ty - y) * 0.06;
    if (Math.abs(x - px) > 0.0005 || Math.abs(y - py) > 0.0005) {
      px = x; py = y;
      if (haze) haze.style.translate = `${x * 18}px ${y * 18}px`;
      if (ring) ring.style.translate = `${x * 8}px ${y * 8}px`;
    }
    requestAnimationFrame(loop);
  })();
}

/* ============================================================
   WORK CARDS — cursor-reactive radial highlight. Injects a spot
   layer per card and feeds it the pointer position.
   ============================================================ */
export function initCardHover() {
  if (!finePointer || reducedMotion) return;
  document.querySelectorAll('.work-card').forEach((card) => {
    const spot = document.createElement('div');
    spot.className = 'work-card__spot';
    spot.setAttribute('aria-hidden', 'true');
    card.appendChild(spot);
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
}

/* ============================================================
   MARQUEE — duplicate each track so the scroll loops seamlessly.
   ============================================================ */
export function initMarquee() {
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    if (!track || m.dataset.seamless) return;
    m.dataset.seamless = '1';

    // Each track animates translateX(-100%) of ONE track width. For a
    // seamless loop the tracks must always cover the viewport during
    // that shift, so we duplicate until the row is wide enough (with
    // headroom for resizes). Every copy is identical → no visible reset.
    const unit = track.getBoundingClientRect().width;
    const clone = () => {
      const c = track.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      m.appendChild(c);
    };
    if (!unit) { clone(); return; }             // fallback if unmeasurable
    const target = m.getBoundingClientRect().width * 2 + unit;   // coverage + headroom
    let total = unit;
    while (total < target) { clone(); total += unit; }
  });
}

/* ============================================================
   ORBIT PULSES — one small luminous particle per orbit, travelling
   a faint ring. Radius → inset so orbits sit on distinct circles;
   random phase keeps them desynchronised, and an occasional flash
   makes the orbit feel energised rather than a steady loop.
   ============================================================ */
const rand = (min, max) => Math.random() * (max - min) + min;

export function initOrbitPulses() {
  // Each orbit = one particle travelling a faint ring. Radius is
  // turned into an inset so the two orbits sit on different circles.
  const CONFIG = [
    { selector: '.hero__ring',         orbits: [{ radius: 50, duration: 30 }, { radius: 36, duration: 23 }] },
    { selector: '.contact__ring',      orbits: [{ radius: 50, duration: 33 }, { radius: 35, duration: 25 }] },
    { selector: '.footer-orbit__ring', orbits: [{ radius: 50, duration: 30 }] },
  ];

  const particles = [];
  CONFIG.forEach(({ selector, orbits }) => {
    document.querySelectorAll(selector).forEach((ring) => {
      ring.querySelectorAll('.orbit-svg, .orbiter').forEach((e) => e.remove());
      orbits.forEach((orbit, i) => {
        const p = document.createElement('div');
        p.className = i % 2 ? 'orbiter orbiter--rev' : 'orbiter';
        p.style.setProperty('--inset', `${(50 - orbit.radius)}%`);
        p.style.setProperty('--dur', `${orbit.duration}s`);
        // random phase so orbits never look synchronised or looping
        p.style.setProperty('--delay', `${-(Math.random() * orbit.duration).toFixed(2)}s`);
        ring.appendChild(p);
        particles.push(p);
      });
    });
  });

  // Occasional, non-synchronised brightening — the wire feels
  // energised rather than a steady decorative loop.
  if (!reducedMotion && particles.length) {
    const flash = () => {
      const p = particles[Math.floor(Math.random() * particles.length)];
      if (p && p.isConnected) {
        p.classList.add('is-flash');
        setTimeout(() => p.classList.remove('is-flash'), rand(700, 1500));
      }
      setTimeout(flash, rand(2400, 6500));
    };
    setTimeout(flash, rand(1600, 3600));
  }
}

/* ============================================================
   FOOTER ORBIT — a faint orbital motif echoing the hero, injected
   into every site-footer so the page closes where it opened.
   ============================================================ */
export function initFooterOrbit() {
  document.querySelectorAll('.site-footer').forEach((footer) => {
    if (footer.querySelector('.footer-orbit')) return;
    const orbit = document.createElement('div');
    orbit.className = 'footer-orbit';
    orbit.setAttribute('aria-hidden', 'true');
    // the traveling particle is injected by initOrbitPulses (runs after)
    orbit.innerHTML = '<div class="footer-orbit__ring"></div>';
    footer.prepend(orbit);
  });
}

/* ============================================================
   DATA STREAM ENGINE — tiny cinematic light particles.
   Each is an overexposed head with soft bloom trailing a short
   streak of dispersed light that tapers into darkness. Every
   particle varies (speed, length, brightness, bloom, timing,
   distance) so the field never reads as procedural. DOM only,
   GPU-composited transform + opacity via the Web Animations API.
   ============================================================ */
export class DataStreamEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.density = options.density ?? 1;
    this.alive = true;
    this.inView = true;
    if (reducedMotion || !container) return;   // no streams under reduced motion
    // don't spawn light into containers nobody can see
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { this.inView = entry.isIntersecting; });
    }, { rootMargin: '160px' }).observe(container);
    this._loop = this._loop.bind(this);
    this._timer = setTimeout(this._loop, rand(400, 2800));   // stagger first spawn
  }

  _loop() {
    if (!this.alive) return;
    if (this.inView && !document.hidden) this.spawn();
    this._timer = setTimeout(this._loop, rand(3600, 12000) / this.density);
  }

  spawn() {
    const W = this.container.clientWidth;
    const H = this.container.clientHeight;
    if (!W || !H) return;

    const vertical = Math.random() < 0.4;      // mostly horizontal, some vertical
    const reverse  = Math.random() < 0.5;
    const length   = rand(90, 260);            // travel-streak length
    const thick    = rand(1.2, 2.6);           // core thickness
    const peak     = rand(0.4, 0.95);          // brightness envelope peak
    const dur      = rand(7000, 16000);        // speed
    const cross    = rand(8, 92);              // crossing position (%)

    const comet = document.createElement('div');
    comet.className = 'comet';
    comet.style.setProperty('--blur', rand(1.4, 3.2).toFixed(2) + 'px');
    comet.style.setProperty('--hs', rand(2.6, 4.6).toFixed(2) + 'px');

    const tail = document.createElement('div'); tail.className = 'comet__tail';
    const head = document.createElement('div'); head.className = 'comet__head';
    comet.append(tail, head);

    let axis, from, to;
    if (!vertical) {
      comet.style.width = length + 'px';
      comet.style.height = thick.toFixed(2) + 'px';
      comet.style.top = cross + '%';
      comet.style.left = '0';
      head.style.top = '50%';
      if (!reverse) { comet.style.setProperty('--dir', '90deg');  head.style.left = '100%'; from = -(length + 80); to = W + 80; }
      else          { comet.style.setProperty('--dir', '270deg'); head.style.left = '0%';   from = W + 80;        to = -(length + 80); }
      axis = 'X';
    } else {
      comet.style.width = thick.toFixed(2) + 'px';
      comet.style.height = length + 'px';
      comet.style.left = cross + '%';
      comet.style.top = '0';
      head.style.left = '50%';
      if (!reverse) { comet.style.setProperty('--dir', '180deg'); head.style.top = '100%'; from = -(length + 80); to = H + 80; }
      else          { comet.style.setProperty('--dir', '0deg');   head.style.top = '0%';   from = H + 80;        to = -(length + 80); }
      axis = 'Y';
    }

    this.container.appendChild(comet);
    comet.animate(
      [
        { transform: `translate${axis}(${from}px)`, opacity: 0 },
        { opacity: peak, offset: 0.12 },
        { opacity: peak, offset: 0.88 },
        { transform: `translate${axis}(${to}px)`, opacity: 0 },
      ],
      { duration: dur, easing: 'linear' }
    ).finished.then(() => comet.remove(), () => comet.remove());
  }

  destroy() { this.alive = false; clearTimeout(this._timer); }
}

/* ============================================================
   ATMOSPHERE RHYTHM — the fixed light field calms as the reader
   descends: hero most alive, footer almost still. One continuous
   environment, no restart between sections. Drives --atmos-energy.
   ============================================================ */
export function initAtmosphereRhythm() {
  const root = document.documentElement;
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = (document.body.scrollHeight - innerHeight) || 1;
    const p = Math.min(Math.max(scrollY / max, 0), 1);
    const energy = 1 - 0.62 * Math.pow(p, 0.85);   // 1 → ~0.38
    root.style.setProperty('--atmos-energy', energy.toFixed(3));
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ============================================================
   MOTION GOVERNOR — sections carrying always-on decorative
   animation (orbits, marquees, pulses, glows) are paused while
   fully offscreen. Nothing visible ever stops: the 160px margin
   resumes motion just before a section re-enters the viewport.
   ============================================================ */
export function initMotionGovernor() {
  const sections = document.querySelectorAll(
    '.hero, .contact, .site-footer, .brands-strip, .brands, .experience, .page-cta'
  );
  if (!sections.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-offstage', !entry.isIntersecting);
    });
  }, { rootMargin: '160px' });
  sections.forEach((s) => io.observe(s));
}
