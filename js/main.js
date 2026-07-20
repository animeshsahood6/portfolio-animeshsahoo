/* ============================================================
   MAIN — orchestration. Order matters:
   split text before reveals; preloader gates hero choreography.
   Every feature init is isolated: one failure never takes the
   page (or the preloader release) down with it.
   ============================================================ */
import { splitLines, initReveals, initMagnetic } from './motion.js';
import { initCursor } from './cursor.js';
import { initNav, initNavIndicator, initPreloader } from './nav.js';
import { initHero } from './hero.js';
import { initCovers } from './projects.js';
import { initCountUp, initWordRotator, initHeroParallax, initCardHover, initMarquee, initFooterOrbit, initOrbitPulses, initAtmosphereRhythm, initMotionGovernor, DataStreamEngine } from './atmosphere.js';
import { Sound } from './sound.js';

// Sound is architected but dormant: register UI cues here later,
// then expose a user-facing toggle that calls Sound.enable().
void Sound;

const safe = (fn) => { try { return fn(); } catch (err) { console.error('[init]', err); } };

safe(splitLines);
document.fonts?.ready.then(() => safe(splitLines));

const cursor = safe(initCursor);
cursor?.setLoading(true);

safe(() => initPreloader(() => {
  cursor?.setLoading(false);
  safe(initReveals);
}));

safe(initNav);
safe(initNavIndicator);
safe(initHero);
safe(initCovers);
safe(initMagnetic);
safe(initCountUp);
safe(initWordRotator);
safe(initHeroParallax);
safe(initCardHover);
safe(initMarquee);
safe(initFooterOrbit);
safe(initOrbitPulses);
safe(initAtmosphereRhythm);
safe(initMotionGovernor);

safe(() => {
  document.querySelectorAll('.hero__streams, .site-footer__streams').forEach((container) => {
    new DataStreamEngine(container, {
      density: container.classList.contains('site-footer__streams') ? 0.45 : 1,
    });
  });
});
