import { initComponents } from './components.js';
import { initMathAnimation } from './math-animation.js';
import { initBlogSort } from './ui.js';

const initCopyEmail = () => {
  const copyButton = document.querySelector('[data-copy-email]');
  if (!copyButton) return;
  
  copyButton.addEventListener('click', async () => {
    const email = copyButton.getAttribute('data-copy-email');
    try {
      await navigator.clipboard.writeText(email);
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
      // Fallback: select the email text
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    }
  });
};

const boot = async () => {
  try {
    document.documentElement.setAttribute('data-theme', 'dark');
    await initComponents();
    initBlogSort();
    initMathAnimation();
    initCopyEmail();
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
