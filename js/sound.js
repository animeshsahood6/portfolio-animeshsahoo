/* ============================================================
   SOUND — architecture only. Nothing plays until a user
   explicitly enables it AND buffers are registered.

   Later: Sound.register('open', 'assets/sfx/open.mp3');
          Sound.enable();          // behind a user toggle
   Call sites already exist (Sound.play('open') etc.) and are
   free no-ops until then.
   ============================================================ */

const registry = new Map();   // name -> { url, buffer }
let ctx = null;
let enabled = false;
let volume = 0.4;

async function load(name) {
  const entry = registry.get(name);
  if (!entry || entry.buffer || !ctx) return;
  try {
    const res = await fetch(entry.url);
    entry.buffer = await ctx.decodeAudioData(await res.arrayBuffer());
  } catch { /* missing asset is never an error */ }
}

export const Sound = {
  register(name, url) { registry.set(name, { url, buffer: null }); },

  async enable() {
    if (enabled) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    enabled = true;
    await Promise.all([...registry.keys()].map(load));
  },

  disable() { enabled = false; },

  setVolume(v) { volume = Math.max(0, Math.min(1, v)); },

  /** Fire-and-forget. Silent unless enabled + registered + loaded. */
  play(name, { rate = 1, gain = 1 } = {}) {
    if (!enabled || !ctx) return;
    const entry = registry.get(name);
    if (!entry?.buffer) return;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    src.buffer = entry.buffer;
    src.playbackRate.value = rate;
    g.gain.value = volume * gain;
    src.connect(g).connect(ctx.destination);
    src.start();
  },
};
