import { initComponents } from './components.js';
import { initMathAnimation } from './math-animation.js';

const boot = async () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  await initComponents();
  initMathAnimation();
};

const ready = () => {
  if (document.fonts && typeof document.fonts.ready === 'object') {
    document.fonts.ready.then(boot);
  } else {
    boot();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
