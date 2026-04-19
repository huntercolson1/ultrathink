const HERO_SCRAMBLE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const HERO_SCRAMBLE_SPEED_MS = 38;
const HERO_SCRAMBLE_FADE_MS = 140;

const randomScrambleCharacter = () =>
  HERO_SCRAMBLE_CHARSET[Math.floor(Math.random() * HERO_SCRAMBLE_CHARSET.length)];

const buildScrambleFrame = (text, revealCount) =>
  text
    .split('')
    .map((character, index) => {
      if (character === '\n' || character === ' ') {
        return character;
      }

      return index < revealCount ? character : randomScrambleCharacter();
    })
    .join('');

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

  let revealCount = 0;
  overlay.classList.add('is-active');
  overlay.textContent = buildScrambleFrame(finalText, revealCount);

  const timer = window.setInterval(() => {
    revealCount += 1;
    overlay.textContent = buildScrambleFrame(finalText, revealCount);

    if (revealCount > finalText.length) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        overlay.classList.add('is-complete');
      }, HERO_SCRAMBLE_FADE_MS);
    }
  }, HERO_SCRAMBLE_SPEED_MS);
};
