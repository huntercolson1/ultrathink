import { initComponents } from './components.js';
import { initMathAnimation } from './math-animation.js';
import { initBlogTags } from './blog-tags.js';
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

const initExternalLinksInMain = () => {
  const main = document.querySelector('main');
  if (!main) return;

  const links = main.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    let parsed;
    try {
      parsed = new window.URL(href, window.location.href);
    } catch {
      return;
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) return;
    if (parsed.origin === window.location.origin) return;

    if (link.getAttribute('target') !== '_blank') {
      link.setAttribute('target', '_blank');
    }

    const relValues = new Set(
      (link.getAttribute('rel') || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((value) => value.toLowerCase())
    );
    relValues.add('noopener');
    relValues.add('noreferrer');
    link.setAttribute('rel', Array.from(relValues).join(' '));
  });
};

const boot = async () => {
  try {
    await initComponents();
    initBlogTags();
    initBlogSort();
    initPostEnhancements();
    initExternalLinksInMain();
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
