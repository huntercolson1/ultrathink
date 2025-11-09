export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Get the base URL path for the site (handles GitHub Pages baseurl)
 * @returns {string} Base path (e.g., '' or '/hunter-site')
 */
export const getBasePath = () => {
  // Try to get base path from the main.js script tag
  const script = document.querySelector('script[src*="main.js"]');
  if (script) {
    const src = script.getAttribute('src');
    // Extract everything before /js/main.js
    const match = src.match(/^(.+)\/js\/main\.js/);
    if (match) {
      const basePath = match[1];
      // Return empty string for root path (/), otherwise return the base path
      return basePath === '/' ? '' : basePath;
    }
  }
  return '';
};

export const lockScroll = (shouldLock) => {
  document.documentElement.style.overflow = shouldLock ? 'hidden' : '';
};

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const createObserver = (callback, options = {}) =>
  new IntersectionObserver(callback, options);

export const trapFocus = (container) => {
  const focusableSelectors =
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const elements = qsa(focusableSelectors, container);
  if (!elements.length) {
    return () => {};
  }

  const first = elements[0];
  const last = elements.at(-1);

  const handleKey = (event) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKey);
  first.focus();

  return () => container.removeEventListener('keydown', handleKey);
};
