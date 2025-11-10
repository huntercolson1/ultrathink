import { initComponents } from './components.js';
import { initMathAnimation } from './math-animation.js';
import { initBlogSort } from './ui.js';

const boot = async () => {
  try {
    document.documentElement.setAttribute('data-theme', 'dark');
    await initComponents();
    initBlogSort();
    initMathAnimation();
  } catch (error) {
    console.error('Main.js: Error in boot', error);
  }
};

const ready = () => {
  try {
    if (document.fonts && typeof document.fonts.ready === 'object') {
      document.fonts.ready.then(boot).catch((error) => {
        console.error('Main.js: Font loading error', error);
        boot();
      });
    } else {
      boot();
    }
  } catch (error) {
    console.error('Main.js: Error in ready', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
