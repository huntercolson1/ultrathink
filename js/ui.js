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

export const initSearch = async (form) => {
  console.log('initSearch called', form);
  const input = form.querySelector('input[type="search"]');
  const resultsContainer = form.querySelector('.c-search__results');
  if (!input || !resultsContainer) {
    console.warn('Search form missing required elements', { input: !!input, resultsContainer: !!resultsContainer });
    return Promise.resolve();
  }

  let tutorials = [];
  let blogPosts = [];
  let searchTimeout;

  // Load tutorials
  try {
    const tutorialsPath = form.dataset.tutorialsSource || './data/tutorials.json';
    console.log('Loading tutorials from:', tutorialsPath);
    const tutorialsResponse = await fetch(tutorialsPath);
    if (tutorialsResponse.ok) {
      tutorials = await tutorialsResponse.json();
      console.log('Loaded tutorials:', tutorials.length);
    } else {
      console.warn('Tutorials response not ok:', tutorialsResponse.status);
    }
  } catch (error) {
    console.warn('Failed to load tutorials:', error);
  }

  // Load blog posts from feed.xml (Jekyll RSS feed)
  try {
    const feedPath = './feed.xml';
    console.log('Loading blog posts from feed:', feedPath);
    const feedResponse = await fetch(feedPath);
    if (feedResponse.ok) {
      const feedText = await feedResponse.text();
      const parser = new DOMParser();
      const feedDoc = parser.parseFromString(feedText, 'text/xml');
      const items = feedDoc.querySelectorAll('item');
      
      blogPosts = Array.from(items).map((item) => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const categories = Array.from(item.querySelectorAll('category')).map(cat => cat.textContent);
        
        return {
          title: title,
          summary: description.replace(/<[^>]*>/g, '').substring(0, 150), // Strip HTML and limit length
          url: link,
          tags: categories,
          date: pubDate
        };
      });
      console.log('Loaded blog posts from feed:', blogPosts.length);
    } else {
      console.warn('Feed response not ok:', feedResponse.status);
      throw new Error('Feed not available');
    }
  } catch (error) {
    console.warn('Failed to load feed.xml, trying alternative methods:', error);
    // Try blog.json as fallback
    try {
      const blogPath = './data/blog.json';
      console.log('Trying blog.json:', blogPath);
      const blogResponse = await fetch(blogPath);
      if (blogResponse.ok) {
        blogPosts = await blogResponse.json();
        console.log('Loaded blog posts from blog.json:', blogPosts.length);
      } else {
        throw new Error('blog.json not available');
      }
    } catch (err) {
      console.warn('blog.json failed, trying DOM:', err);
      // Last resort: try to get posts from the page DOM
      const postElements = document.querySelectorAll('[data-blog-post]');
      blogPosts = Array.from(postElements).map((post) => {
        const titleEl = post.querySelector('h2, h4');
        const linkEl = post.querySelector('a[href]');
        return {
          title: titleEl?.textContent?.trim() || '',
          summary: post.querySelector('.u-text-muted')?.textContent?.trim() || '',
          url: linkEl?.href || '',
          tags: Array.from(post.querySelectorAll('.c-badge')).map((badge) => badge.textContent.replace('#', '')),
          date: post.dataset.published || ''
        };
      });
      console.log('Loaded blog posts from DOM:', blogPosts.length);
    }
  }

  const searchItems = (query) => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results = [];
    console.log('Searching for:', query, { tutorials: tutorials.length, blogPosts: blogPosts.length });

    // Search tutorials
    tutorials.forEach((tutorial) => {
      const titleMatch = tutorial.title?.toLowerCase().includes(lowerQuery);
      const summaryMatch = tutorial.summary?.toLowerCase().includes(lowerQuery);
      if (titleMatch || summaryMatch) {
        results.push({
          type: 'tutorial',
          title: tutorial.title,
          summary: tutorial.summary,
          url: tutorial.url,
          meta: tutorial.updated || tutorial.type || 'Tutorial'
        });
      }
    });

    // Search blog posts
    blogPosts.forEach((post) => {
      const titleMatch = post.title?.toLowerCase().includes(lowerQuery);
      const summaryMatch = post.summary?.toLowerCase().includes(lowerQuery);
      const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
      if (titleMatch || summaryMatch || tagsMatch) {
        results.push({
          type: 'post',
          title: post.title,
          summary: post.summary,
          url: post.url,
          meta: post.date ? new Date(post.date).toLocaleDateString() : 'Blog post'
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 results
  };

  const renderResults = (results) => {
    console.log('Rendering results:', results.length, results);
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="c-search__result-item"><p class="u-text-muted">No results found</p></div>';
      resultsContainer.hidden = false;
      console.log('Showing no results message');
      return;
    }

    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const item = document.createElement('a');
      item.className = 'c-search__result-item';
      item.href = result.url;
      item.innerHTML = `
        <div class="c-search__result-title">${result.title}</div>
        ${result.summary ? `<div class="c-search__result-meta">${result.summary}</div>` : ''}
        <div class="c-search__result-meta">${result.meta}</div>
      `;
      fragment.appendChild(item);
    });

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(fragment);
    resultsContainer.hidden = false;
    console.log('Results container shown, hidden:', resultsContainer.hidden);
  };

  input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      resultsContainer.hidden = true;
      resultsContainer.innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(() => {
      const results = searchItems(query);
      renderResults(results);
    }, 200);
  });
  
  // Prevent form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query.length >= 2) {
      const results = searchItems(query);
      renderResults(results);
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) {
      const results = searchItems(input.value.trim());
      renderResults(results);
    }
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) {
      resultsContainer.hidden = true;
    }
  });

  // Handle keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultsContainer.hidden = true;
      input.blur();
    }
  });
  
  // Debug logging
  console.log('Search initialized:', {
    tutorials: tutorials.length,
    blogPosts: blogPosts.length
  });
};
