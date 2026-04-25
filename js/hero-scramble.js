const HERO_SCRAMBLE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const HERO_SCRAMBLE_DURATION_MS = 1000;
const HERO_SCRAMBLE_FADE_MS = 160;
const HERO_SCRAMBLE_STAGGER_MS = 32;
const HERO_SCRAMBLE_TICK_MS = 55;

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const getDecodeCharacter = (index, elapsed) => {
  const tick = Math.floor(elapsed / HERO_SCRAMBLE_TICK_MS);
  return HERO_SCRAMBLE_CHARSET[(index * 7 + tick * 3) % HERO_SCRAMBLE_CHARSET.length];
};

const buildScrambleFrame = (text, elapsed) =>
  text
    .split('')
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      const localProgress = clamp(
        (elapsed - index * HERO_SCRAMBLE_STAGGER_MS) / HERO_SCRAMBLE_DURATION_MS,
        0,
        1
      );
      const settleProgress = easeOutCubic(localProgress);
      const isSettled = settleProgress > 0.92;

      return isSettled ? character : getDecodeCharacter(index, elapsed);
    })
    .join('');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const initHeroScramble = () => {
  const title = document.querySelector('[data-hero-scramble]');
  if (!title || title.dataset.heroScrambleReady === 'true') {
    return;
  }

  title.dataset.heroScrambleReady = 'true';

  const overlay = title.querySelector('.construct-hero__title-overlay');
  if (!overlay) {
    return;
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const finalText = (title.dataset.heroScramble || '').split('|').join('\n');

  if (!finalText || prefersReducedMotion) {
    overlay.textContent = '';
    return;
  }

  let startTime = null;
  let frameId = null;

  const runScramble = () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    startTime = null;
    overlay.classList.remove('is-complete');
    overlay.classList.add('is-active');
    title.classList.add('is-scrambling');
    overlay.textContent = buildScrambleFrame(finalText, 0);
    frameId = window.requestAnimationFrame(render);
  };

  const render = (timestamp) => {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    overlay.textContent = buildScrambleFrame(finalText, elapsed);

    if (elapsed >= HERO_SCRAMBLE_DURATION_MS + finalText.length * HERO_SCRAMBLE_STAGGER_MS) {
      overlay.textContent = finalText;
      window.setTimeout(() => {
        overlay.classList.add('is-complete');
        title.classList.remove('is-scrambling');
      }, HERO_SCRAMBLE_FADE_MS);
      frameId = null;
      return;
    }

    frameId = window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(runScramble);
};
