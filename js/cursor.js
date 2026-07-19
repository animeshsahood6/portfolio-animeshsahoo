/* ============================================================
   CURSOR — dot follows raw, ring follows with inertia.
   States: default · hover · view (project) · drag · external ·
   text · down · loading. Transitions morph, never snap.
   ============================================================ */
import { finePointer, reducedMotion } from './motion.js';

const STATES = ['is-hover', 'is-view', 'is-external', 'is-text'];

export function initCursor() {
  const root = document.getElementById('cursor');
  if (!root || !finePointer || reducedMotion) { root?.remove(); return; }

  document.body.classList.add('has-cursor');

  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = document.getElementById('cursorLabel');
  // soft trailing glow — lags further behind for a gentle comet feel
  const glow = document.createElement('div');
  glow.className = 'cursor__glow';
  root.appendChild(glow);

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;
  let gx = mx, gy = my;
  let visible = false;

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!visible) { rx = mx; ry = my; visible = true; root.style.opacity = 1; }
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  addEventListener('mousedown', () => root.classList.add('is-down'));
  addEventListener('mouseup', () => root.classList.remove('is-down'));

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    gx += (mx - gx) * 0.09;
    gy += (my - gy) * 0.09;
    ring.style.translate = `${rx}px ${ry}px`;
    label.style.translate = `${rx}px ${ry}px`;
    glow.style.translate = `${gx}px ${gy}px`;
    requestAnimationFrame(loop);
  })();

  const setState = (state, text = '') => {
    STATES.forEach((s) => root.classList.toggle(s, s === state));
    if (text) label.textContent = text;
  };

  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.closest('.work-card')) return setState('is-view', 'View');
    const link = t.closest('a[target="_blank"], a[href^="http"], a[href^="mailto"], a[href^="tel"]');
    if (link) return setState('is-external', '↗');
    if (t.closest('a, button, [role="button"], .chips li, .nav__toggle')) return setState('is-hover');
    if (t.closest('p, h1, h2, h3, blockquote, dd, li')) return setState('is-text');
    setState(null);
  }, { passive: true });

  document.addEventListener('mouseleave', () => { root.style.opacity = 0; visible = false; });

  // Loading state hooks (used by the preloader)
  return {
    setLoading(on) { root.classList.toggle('is-loading', on); },
  };
}
