import { qs } from './utils.js';
import { initNav, initScrollHeader } from './ui.js';

const registry = {
  nav: initNav,
  'scroll-header': initScrollHeader
};

export const initComponents = async () => {
  const componentPromises = [];
  
  document.querySelectorAll('[data-component]').forEach((node) => {
    const keys = node.dataset.component.split(' ').filter(Boolean);
    keys.forEach((key) => {
      if (registry[key]) {
        const result = registry[key](node);
        // Handle async components
        if (result instanceof Promise) {
          componentPromises.push(result);
        }
      }
    });
  });
  
  // Wait for all async components to initialize
  await Promise.all(componentPromises);
  
  // ensure skip links focus target exists
  const skip = qs('.skip-link');
  if (skip) {
    skip.addEventListener('click', () => {
      const target = qs(skip.getAttribute('href'));
      target?.focus();
    });
  }
};
