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

export const initBlogFilter = (node) => {
  const targetSelector = node.dataset.target;
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  const posts = Array.from(target.querySelectorAll('[data-blog-post]'));
  if (!posts.length) return;

  const emptyTemplate = target.querySelector('[data-blog-empty]');
  let emptyMessage = null;
  if (emptyTemplate) {
    emptyMessage = emptyTemplate;
    emptyTemplate.remove();
  }

  const allPosts = posts.map((post) => ({
    node: post,
    tags: (post.dataset.tags || '')
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    year: post.dataset.year,
    date: post.dataset.published ? new Date(post.dataset.published) : new Date()
  }));

  const filterButtons = Array.from(node.querySelectorAll('[data-filter-type]'));
  const sortButtons = Array.from(node.querySelectorAll('[data-sort]'));
  const resetButton = node.querySelector('[data-filter-reset]');

  let currentFilter = { type: 'all', value: null };
  let sortOrder = 'desc';

  const setActive = (buttonGroup, activeButton) => {
    buttonGroup.forEach((btn) => {
      const isActive = btn === activeButton;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const applyRender = () => {
    let workingSet = allPosts;

    if (currentFilter.type === 'tag') {
      workingSet = allPosts.filter((item) => item.tags.includes(currentFilter.value));
    } else if (currentFilter.type === 'year') {
      workingSet = allPosts.filter((item) => item.year === currentFilter.value);
    } else if (currentFilter.type === 'recent') {
      const limit = Number(currentFilter.value) || 5;
      workingSet = allPosts
        .slice()
        .sort((a, b) => b.date - a.date)
        .slice(0, limit);
    }

    const sorted = workingSet
      .slice()
      .sort((a, b) => (sortOrder === 'asc' ? a.date - b.date : b.date - a.date));

    const fragment = document.createDocumentFragment();
    sorted.forEach((item) => fragment.appendChild(item.node));

    target.innerHTML = '';
    if (!sorted.length && emptyMessage) {
      emptyMessage.hidden = false;
      emptyMessage.setAttribute('aria-live', 'polite');
      fragment.appendChild(emptyMessage);
    } else if (emptyMessage) {
      emptyMessage.hidden = true;
    }

    target.appendChild(fragment);
  };

  node.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.filterReset !== undefined) {
      currentFilter = { type: 'all', value: null };
      sortOrder = 'desc';
      const allButton = filterButtons.find((btn) => btn.dataset.filterType === 'all');
      const newestButton = sortButtons.find((btn) => btn.dataset.sort === 'desc');
      setActive(filterButtons, allButton);
      setActive(sortButtons, newestButton);
      applyRender();
      return;
    }

    if (button.dataset.filterType) {
      const type = button.dataset.filterType;
      const value = button.dataset.filterValue || null;
      const isSameSelection = button.classList.contains('is-active') && type !== 'all';

      if (isSameSelection) {
        const allButton = filterButtons.find((btn) => btn.dataset.filterType === 'all');
        currentFilter = { type: 'all', value: null };
        setActive(filterButtons, allButton);
      } else {
        currentFilter = { type, value };
        setActive(filterButtons, button);
      }
      applyRender();
      return;
    }

    if (button.dataset.sort) {
      sortOrder = button.dataset.sort;
      setActive(sortButtons, button);
      applyRender();
    }
  });

  filterButtons.forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
  });
  sortButtons.forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
  });

  if (resetButton) {
    resetButton.setAttribute('aria-pressed', 'false');
  }

  applyRender();
};
