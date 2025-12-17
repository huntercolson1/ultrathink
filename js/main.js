import { initComponents } from './components.js';
import { initMathAnimation } from './math-animation.js';
import { initBlogSort, initPostEnhancements, initThemeToggle } from './ui.js';

// Initialize theme before render to prevent flash
const initTheme = () => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('ultrathink-theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
};

// Run theme init immediately to prevent flash
initTheme();

const boot = async () => {
  try {
    await initComponents();
    initBlogSort();
    initPostEnhancements();
    initMathAnimation();

    // Initialize theme toggle button
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      initThemeToggle(themeToggle);
    }
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
