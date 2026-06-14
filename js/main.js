import { initComponents } from './components.js';
import { initBlogTags } from './blog-tags.js';
import { initHeroScramble } from './hero-scramble.js?v=design-20260516b';
import { initHomeLab } from './home-lab.js?v=particle-field-20260613o';
import {
  initBlogSort,
  initPostEnhancements,
  initScrollBehavior,
  initThemeToggle
} from './ui.js?v=toc-mobile-20260528b';

const THEME_STORAGE_KEY = 'ultrathink-theme';

const getPreferredTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) return savedTheme;
  } catch {
    return 'dark';
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const syncThemeColor = (theme) => {
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
  }
};

// The head include sets the first-paint theme. This keeps runtime state aligned.
const initTheme = () => {
  const root = document.documentElement;
  const theme = getPreferredTheme();
  root.setAttribute('data-theme', theme);
  syncThemeColor(theme);
};

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
    initScrollBehavior();
    initBlogTags();
    initBlogSort();
    initPostEnhancements();
    initExternalLinksInMain();
    initHeroScramble();
    initHomeLab();

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
