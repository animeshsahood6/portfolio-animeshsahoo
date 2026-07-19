/* ============================================================
   MOTION — one system: reveals, split lines, counters, magnetic
   ============================================================ */

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* --- Split headlines into masked lines ---------------------- */
export function splitLines() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    // Re-splitting (e.g. after fonts load) rebuilds from the original text
    const text = (el.dataset.splitText ?? el.textContent).trim();
    el.dataset.splitText = text;
    const wasIn = el.classList.contains('is-in');
    const words = text.split(/\s+/);
    el.setAttribute('aria-label', text);
    el.textContent = '';

    // Lay words out, then group by rendered line
    const probe = words.map((w) => {
      const s = document.createElement('span');
      s.textContent = w + ' ';
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });

    const lines = [];
    let lastTop = null;
    probe.forEach((s) => {
      const top = s.offsetTop;
      if (top !== lastTop) { lines.push([]); lastTop = top; }
      lines[lines.length - 1].push(s.textContent);
    });

    el.textContent = '';
    lines.forEach((lineWords, i) => {
      const line = document.createElement('span');
      line.className = 'split-line';
      line.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = lineWords.join('').trimEnd();
      inner.style.setProperty('--line-i', i);
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.querySelectorAll('.split-line > span').forEach((s, i) => s.style.setProperty('--line-i', i));
    if (wasIn) el.classList.add('is-in');
  });
}

/* --- Scroll reveal observer ---------------------------------- */
export function initReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.revealDelay;
      if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
      el.classList.add('is-in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => io.observe(el));

  // Stagger siblings inside grids automatically
  document.querySelectorAll('.work-grid, .toolkit').forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (child.matches('[data-reveal]')) {
        child.style.setProperty('--reveal-delay', `${i * 70}ms`);
      }
    });
  });
}

/* --- Magnetic elements ----------------------------------------- */
export function initMagnetic() {
  if (!finePointer || reducedMotion) return;
  const strength = { '': 0.32, soft: 0.14 };
  document.querySelectorAll('[data-magnetic], [data-magnetic-soft]').forEach((el) => {
    const k = el.hasAttribute('data-magnetic-soft') ? strength.soft : strength[''];
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = 'transform 500ms cubic-bezier(0.34, 1.4, 0.44, 1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });
}
