/* ============================================================
   MAIN — orchestration. Order matters:
   split text before reveals; preloader gates hero choreography.
   ============================================================ */
import { splitLines, initReveals, initMagnetic } from './motion.js';
import { initCursor } from './cursor.js';
import { initNav, initNavIndicator, initPreloader } from './nav.js';
import { initHero } from './hero.js';
import { initCovers } from './projects.js';
import { initCountUp, initWordRotator, initHeroParallax, initCardHover, initMarquee, initFooterOrbit, initOrbitPulses, initAtmosphereRhythm, DataStreamEngine } from './atmosphere.js';
import { Sound } from './sound.js';

// Sound is architected but dormant: register UI cues here later,
// then expose a user-facing toggle that calls Sound.enable().
void Sound;

splitLines();
document.fonts?.ready.then(() => splitLines());

const cursor = initCursor();
cursor?.setLoading(true);

initPreloader(() => {
  cursor?.setLoading(false);
  initReveals();
});

initNav();
initNavIndicator();
initHero();
initCovers();
initMagnetic();
initCountUp();
initWordRotator();
initHeroParallax();
initCardHover();
initMarquee();
initFooterOrbit();
initOrbitPulses();
initAtmosphereRhythm();
const streamContainers = document.querySelectorAll(
    '.hero__streams, .site-footer__streams'
);

streamContainers.forEach(container => {

    new DataStreamEngine(container, {
        density: container.classList.contains('site-footer__streams') ? 0.45 : 1
    });

});