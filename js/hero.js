/* ============================================================
   HERO — the composition is the Figma's (glow + type stack).
   Motion layer only: the glow drifts gently with the pointer
   and recedes on scroll. Nothing is added to the composition.
   ============================================================ */
import { finePointer, reducedMotion } from './motion.js';

export function initHero() {
  const hero = document.querySelector('.hero');
  const glow = hero?.querySelector('.hero__glow');
  if (!hero || !glow || reducedMotion) return;

  let tx = 0, ty = 0, x = 0, y = 0;

  if (finePointer) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 40;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 24;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
  }

  let scrollFade = 0;
  addEventListener('scroll', () => { scrollFade = Math.min(scrollY, innerHeight); }, { passive: true });

  // Dirty-checked: a blurred 1000px layer only repaints when it moves
  let px = NaN, py = NaN, pf = NaN;
  (function loop() {
    x += (tx - x) * 0.05;
    y += (ty - y) * 0.05;
    const ry = y + scrollFade * 0.15;
    if (Math.abs(x - px) > 0.1 || Math.abs(ry - py) > 0.1 || Math.abs(scrollFade - pf) > 0.5) {
      px = x; py = ry; pf = scrollFade;
      glow.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${ry}px)`;
      glow.style.opacity = String(1 - (scrollFade / innerHeight) * 0.85);
    }
    requestAnimationFrame(loop);
  })();
}
