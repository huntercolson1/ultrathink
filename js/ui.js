import { qs, lockScroll, trapFocus, prefersReducedMotion } from './utils.js';

export const initNav = (header) => {
  const toggle = qs('[data-nav-toggle]', header);
  const drawer = document.querySelector('[data-nav-drawer]');
  if (!toggle || !drawer) return;

  const panel = qs('.c-drawer__panel', drawer);
  let releaseFocus = () => {};

const openDrawer = () => {
  drawer.classList.add('is-active');
  toggle.classList.add('is-active');
  toggle.setAttribute('aria-expanded', 'true');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll(true);
  releaseFocus = trapFocus(panel);
};

const closeDrawer = () => {
  drawer.classList.remove('is-active');
  toggle.classList.remove('is-active');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  lockScroll(false);
  releaseFocus();
};

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawer.addEventListener('click', (event) => {
    if (event.target === drawer) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-active')) {
      closeDrawer();
    }
  });
};

export const initScrollHeader = (header) => {
  const toggleClass = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-condensed');
    } else {
      header.classList.remove('is-condensed');
    }
  };
  toggleClass();
  window.addEventListener('scroll', toggleClass, { passive: true });
};

export const initThemeToggle = (node) => {
  const root = document.documentElement;
  node.addEventListener('click', () => {
    const theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    node.textContent = theme === 'light' ? 'Dark mode' : 'Light mode';
  });
};

export const initStats = (node) => {
  const entries = node.querySelectorAll('[data-target-value]');
  if (!entries.length) return;

  const increment = (el) => {
    const target = Number(el.dataset.targetValue);
    const duration = prefersReducedMotion() ? 0 : 900;
    if (duration === 0) {
      el.textContent = target.toLocaleString();
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.floor(progress * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entriesList) => {
      entriesList.forEach((entry) => {
        if (entry.isIntersecting) {
          increment(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -10% 0px'
    }
  );

  entries.forEach((entry) => observer.observe(entry));
};
