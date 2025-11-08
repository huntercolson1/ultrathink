import { initComponents } from './components.js';

const boot = () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  initComponents();
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
