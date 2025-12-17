import { qs, lockScroll, trapFocus, prefersReducedMotion, getBasePath } from './utils.js';

export const initNav = (header) => {
  const toggle = qs('[data-nav-toggle]', header);
  const drawer = document.querySelector('[data-nav-drawer]');
  if (!toggle || !drawer) return;

  const panel = qs('.c-drawer__panel', drawer);
  if (!panel) return;
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
    if (!drawer.classList.contains('is-active')) return;
    drawer.classList.remove('is-active');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    releaseFocus();
    releaseFocus = () => {};
    toggle.focus({ preventScroll: true });
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

  panel.querySelectorAll('[data-nav-close]').forEach((btn) => {
    btn.addEventListener('click', closeDrawer);
  });

  panel.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
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
  
  const updateAriaLabel = (theme) => {
    node.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  
  // Initialize aria-label based on current theme
  updateAriaLabel(root.getAttribute('data-theme') || 'dark');
  
  node.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('ultrathink-theme', newTheme);
    updateAriaLabel(newTheme);
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

  const postNodes = Array.from(target.querySelectorAll('[data-blog-post]'));
  if (!postNodes.length) return;

  const searchInput = node.querySelector('[data-filter-search]');

  const emptyTemplate = target.querySelector('[data-blog-empty]');
  let emptyMessage = null;
  if (emptyTemplate) {
    emptyMessage = emptyTemplate;
    emptyTemplate.remove();
    emptyMessage.setAttribute('role', 'status');
    emptyMessage.setAttribute('aria-live', 'polite');
  }

  const allPosts = postNodes.map((post) => {
    const tags = (post.dataset.tags || '')
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const year = post.dataset.year || '';
    const title = post.querySelector('h2, h3, h4')?.textContent?.trim() || '';
    const summary = post.querySelector('.reading-width')?.textContent?.trim() || '';
    const textContent = post.textContent?.toLowerCase() || '';
    const tagSearch = tags.join(' ');
    const searchText = `${title} ${summary} ${tagSearch}`.toLowerCase();

    return {
      node: post,
      tags,
      year,
      yearNumber: Number.parseInt(year, 10) || 0,
      date: post.dataset.published ? new Date(post.dataset.published) : new Date(),
      title,
      primaryTag: tags[0] || '',
      searchText: `${searchText} ${textContent}`.trim()
    };
  });

  const filterButtons = Array.from(
    node.querySelectorAll('[data-filter-group],[data-filter-type]')
  );
  const sortButtons = Array.from(node.querySelectorAll('[data-sort]'));
  const resetButton = node.querySelector('[data-filter-reset]');
  const countNode = node.querySelector('[data-blog-count]');
  const activeFiltersContainer = node.querySelector('[data-active-filters]');
  const activeFiltersList = node.querySelector('[data-active-filters-list]');

  const filterGroups = new Map();
  const defaultButtons = new Map();

  const getGroupName = (btn) =>
    btn.dataset.filterGroup ||
    btn.dataset.filterType ||
    btn.getAttribute('data-filter-group') ||
    btn.getAttribute('data-filter-type');

  const getButtonValue = (btn) =>
    btn.dataset.filterValue ?? btn.getAttribute('data-filter-value') ?? null;

  filterButtons.forEach((btn) => {
    const group = getGroupName(btn);
    if (!group) return;
    if (!filterGroups.has(group)) filterGroups.set(group, []);
    filterGroups.get(group).push(btn);
    if (btn.hasAttribute('data-filter-default')) {
      defaultButtons.set(group, btn);
    }
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
  });

  if (!defaultButtons.has('view')) {
    const fallbackView = (filterGroups.get('view') || []).find((btn) => {
      const value = getButtonValue(btn);
      return !value || value === 'all';
    });
    if (fallbackView) {
      defaultButtons.set('view', fallbackView);
      fallbackView.classList.add('is-active');
      fallbackView.setAttribute('aria-pressed', 'true');
    }
  }

  const normalizeViewValue = (group, value) => {
    if (!value || value === 'all') return 'all';
    if (group === 'recent' && !String(value).startsWith('recent:')) {
      return `recent:${value}`;
    }
    return value;
  };

  const defaultViewButton = defaultButtons.get('view');
  const initialViewValue = normalizeViewValue(
    defaultViewButton ? getGroupName(defaultViewButton) : 'view',
    defaultViewButton ? getButtonValue(defaultViewButton) : 'all'
  );

  const state = {
    viewSelection: initialViewValue,
    tags: [],
    year: null,
    query: ''
  };

  let sortMode = 'date-desc';
  const totalPosts = allPosts.length;
  const collator =
    typeof Intl !== 'undefined' && Intl.Collator
      ? new Intl.Collator(undefined, { sensitivity: 'base' })
      : null;
  let animationTimeout;

  const triggerFeedAnimation = () => {
    if (prefersReducedMotion()) return;
    target.classList.add('is-filtering');
    window.clearTimeout(animationTimeout);
    animationTimeout = window.setTimeout(
      () => target.classList.remove('is-filtering'),
      220
    );
  };

  const getViewButtons = () => [
    ...(filterGroups.get('view') || []),
    ...(filterGroups.get('recent') || [])
  ];

  const updateViewButtons = () => {
    const buttons = getViewButtons();
    const activeValue = state.viewSelection || 'all';
    buttons.forEach((btn) => {
      const group = getGroupName(btn) || 'view';
      const normalized = normalizeViewValue(group, getButtonValue(btn));
      const isActive = normalized === activeValue;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateTagButtons = () => {
    const buttons = filterGroups.get('tag') || [];
    buttons.forEach((btn) => {
      const value = getButtonValue(btn);
      const isActive = value ? state.tags.includes(value) : false;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateYearButtons = () => {
    const buttons = filterGroups.get('year') || [];
    buttons.forEach((btn) => {
      const value = getButtonValue(btn);
      const isActive = value === state.year;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const setActiveSort = (activeButton) => {
    sortButtons.forEach((btn) => {
      const isActive = btn === activeButton;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const defaultSortButton =
    sortButtons.find((btn) => btn.dataset.sort === 'date-desc') || sortButtons[0];
  if (defaultSortButton) {
    setActiveSort(defaultSortButton);
    sortMode = defaultSortButton.dataset.sort || 'date-desc';
  }

  if (resetButton) {
    resetButton.setAttribute('aria-pressed', 'false');
  }

  const parseRecentLimit = (value) => {
    if (!value || !value.startsWith('recent:')) return null;
    const limit = Number(value.split(':')[1]);
    return Number.isFinite(limit) ? limit : null;
  };

  const getButtonForValue = (group, value) => {
    if (group === 'view') {
      return getViewButtons().find((btn) => {
        const btnGroup = getGroupName(btn) || 'view';
        return normalizeViewValue(btnGroup, getButtonValue(btn)) === value;
      });
    }
    return (filterGroups.get(group) || []).find((btn) => getButtonValue(btn) === value);
  };

  const updateCount = (visible, matching) => {
    if (!countNode) return;
    const totalLabel = totalPosts === 1 ? 'post' : 'posts';
    const matchingLabel = matching === 1 ? 'post' : 'posts';

    if (matching === totalPosts && visible === totalPosts) {
      countNode.textContent = `Showing all ${totalPosts} ${totalLabel}`;
      return;
    }

    if (visible !== matching) {
      countNode.textContent = `Showing ${visible} of ${matching} matching ${matchingLabel} (${totalPosts} total ${totalLabel})`;
    } else {
      countNode.textContent = `Showing ${matching} of ${totalPosts} ${matchingLabel}`;
    }
  };

  const renderActiveFilters = () => {
    if (!activeFiltersContainer || !activeFiltersList) return;

    const chips = [];

    if (state.viewSelection && state.viewSelection !== 'all') {
      const activeViewButton = getButtonForValue('view', state.viewSelection);
      const label = activeViewButton ? activeViewButton.textContent.trim() : 'Recent';
      chips.push({ group: 'view', text: `View: ${label}` });
    }

    state.tags.forEach((tag) => {
      const activeTagButton = getButtonForValue('tag', tag);
      const label = activeTagButton ? activeTagButton.textContent.trim() : `#${tag}`;
      chips.push({ group: 'tag', value: tag, text: `Tag: ${label}` });
    });

    if (state.year) {
      const activeYearButton = getButtonForValue('year', state.year);
      const label = activeYearButton ? activeYearButton.textContent.trim() : state.year;
      chips.push({ group: 'year', value: state.year, text: `Year: ${label}` });
    }

    if (state.query) {
      chips.push({ group: 'search', text: `Search: “${state.query}”` });
    }

    if (!chips.length) {
      activeFiltersList.innerHTML = '';
      activeFiltersContainer.hidden = true;
      activeFiltersContainer.setAttribute('aria-hidden', 'true');
      return;
    }

    const fragment = document.createDocumentFragment();
    chips.forEach((chipInfo) => {
      const chipButton = document.createElement('button');
      chipButton.type = 'button';
      chipButton.className = 'c-chip';
      chipButton.dataset.filterRemove = chipInfo.group;
      if (chipInfo.value) {
        chipButton.dataset.filterRemoveValue = chipInfo.value;
      }
      chipButton.setAttribute('aria-label', `Remove ${chipInfo.text}`);
      chipButton.innerHTML = `<span class="c-chip__label">${chipInfo.text}</span><span aria-hidden="true">&times;</span>`;
      fragment.appendChild(chipButton);
    });

    activeFiltersList.innerHTML = '';
    activeFiltersList.appendChild(fragment);
    activeFiltersContainer.hidden = false;
    activeFiltersContainer.setAttribute('aria-hidden', 'false');
  };

  const clearGroup = (group, value = null) => {
    if (group === 'view') {
      state.viewSelection = 'all';
      updateViewButtons();
      return;
    }

    if (group === 'tag') {
      state.tags = value ? state.tags.filter((tag) => tag !== value) : [];
      updateTagButtons();
      return;
    }

    if (group === 'year') {
      state.year = null;
      updateYearButtons();
      return;
    }

    if (group === 'search') {
      state.query = '';
      if (searchInput) {
        searchInput.value = '';
      }
    }
  };

  const compareText = (a, b) => {
    if (collator) return collator.compare(a, b);
    return a.localeCompare(b);
  };

  const getSortComparator = () => {
    switch (sortMode) {
      case 'date-asc':
        return (a, b) => a.date - b.date;
      case 'year-desc':
        return (a, b) => b.yearNumber - a.yearNumber || b.date - a.date;
      case 'year-asc':
        return (a, b) => a.yearNumber - b.yearNumber || a.date - b.date;
      case 'tag-asc':
        return (a, b) =>
          compareText((a.primaryTag || '').toLowerCase(), (b.primaryTag || '').toLowerCase()) ||
          compareText(a.title.toLowerCase(), b.title.toLowerCase());
      case 'tag-desc':
        return (a, b) =>
          compareText((b.primaryTag || '').toLowerCase(), (a.primaryTag || '').toLowerCase()) ||
          compareText(a.title.toLowerCase(), b.title.toLowerCase());
      case 'date-desc':
      default:
        return (a, b) => b.date - a.date;
    }
  };

  const applyRender = () => {
    triggerFeedAnimation();

    let filtered = allPosts.slice();

    if (state.tags.length) {
      filtered = filtered.filter((item) =>
        state.tags.every((tag) => item.tags.includes(tag))
      );
    }

    if (state.year) {
      const yearStr = String(state.year);
      filtered = filtered.filter((item) => String(item.year) === yearStr);
    }

    if (state.query) {
      const query = state.query.toLowerCase();
      filtered = filtered.filter((item) => item.searchText.includes(query));
    }

    const matchingCount = filtered.length;

    let workingSet = filtered;
    const recentLimit = parseRecentLimit(state.viewSelection);
    if (recentLimit) {
      workingSet = filtered
        .slice()
        .sort((a, b) => b.date - a.date)
        .slice(0, recentLimit);
    }

    const comparator = getSortComparator();
    const sorted = workingSet.slice().sort(comparator);

    target.textContent = '';
    if (sorted.length) {
      if (emptyMessage) emptyMessage.hidden = true;
      sorted.forEach((item) => target.appendChild(item.node));
    } else if (emptyMessage) {
      emptyMessage.hidden = false;
      target.appendChild(emptyMessage);
    }

    updateCount(sorted.length, matchingCount);
    renderActiveFilters();
  };

  const handleFilterGroupButton = (button) => {
    const group = getGroupName(button);
    const value = getButtonValue(button);
    if (!group) return;

    if (group === 'view' || group === 'recent') {
      const normalized = normalizeViewValue(group, value);
      state.viewSelection = normalized;
      updateViewButtons();
      applyRender();
      return;
    }

    if (group === 'tag') {
      if (!value) return;
      if (state.tags.includes(value)) {
        state.tags = state.tags.filter((tag) => tag !== value);
      } else {
        state.tags = [...state.tags, value];
      }
      updateTagButtons();
      applyRender();
      return;
    }

    if (group === 'year') {
      state.year = state.year === value ? null : value;
      updateYearButtons();
      applyRender();
    }
  };

  let searchDebounce;
  if (searchInput) {
    const runSearch = () => {
      const value = searchInput.value.trim();
      if (value === state.query) return;
      state.query = value;
      applyRender();
    };

    searchInput.addEventListener('input', () => {
      window.clearTimeout(searchDebounce);
      searchDebounce = window.setTimeout(runSearch, 140);
    });

    searchInput.addEventListener('search', runSearch);
  }

  activeFiltersContainer?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter-remove]');
    if (!chip) return;
    clearGroup(chip.dataset.filterRemove, chip.dataset.filterRemoveValue);
    applyRender();
  });

  node.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.hasAttribute('data-filter-reset')) {
      event.preventDefault();
      clearGroup('view');
      clearGroup('tag');
      clearGroup('year');
      clearGroup('search');
      sortMode = defaultSortButton?.dataset.sort || 'date-desc';
      if (defaultSortButton) {
        setActiveSort(defaultSortButton);
      }
      applyRender();
      return;
    }

    if (button.hasAttribute('data-filter-group') || button.hasAttribute('data-filter-type')) {
      event.preventDefault();
      handleFilterGroupButton(button);
      return;
    }

    if (button.hasAttribute('data-sort')) {
      event.preventDefault();
      const newSort = button.dataset.sort;
      if (newSort && sortMode !== newSort) {
        sortMode = newSort;
        setActiveSort(button);
        applyRender();
      }
    }
  });

  updateViewButtons();
  updateTagButtons();
  updateYearButtons();

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

  const basePath = getBasePath();
  let tutorials = [];
  let blogPosts = [];
  let searchTimeout;

  // Load tutorials
  try {
    const tutorialsPath = form.dataset.tutorialsSource || `${basePath}/data/tutorials.json`;
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
    const feedPath = `${basePath}/feed.xml`;
    console.log('Loading blog posts from feed:', feedPath);
    const feedResponse = await fetch(feedPath);
    if (feedResponse.ok) {
      const feedText = await feedResponse.text();
      const parser = new DOMParser();
      const feedDoc = parser.parseFromString(feedText, 'text/xml');
      // Jekyll generates Atom feeds, which use <entry> instead of <item>
      const items = feedDoc.querySelectorAll('entry, item');
      
      blogPosts = Array.from(items).map((item) => {
        // Atom uses <title> and <summary>, RSS uses <title> and <description>
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('summary, description')?.textContent || '';
        // Atom uses <link href="...">, RSS uses <link>text</link>
        const linkEl = item.querySelector('link');
        const link = linkEl?.getAttribute('href') || linkEl?.textContent || '';
        // Atom uses <published> or <updated>, RSS uses <pubDate>
        const pubDate = item.querySelector('published, updated, pubDate')?.textContent || '';
        // Atom uses <category term="...">, RSS uses <category>text</category>
        const categories = Array.from(item.querySelectorAll('category')).map(cat => 
          cat.getAttribute('term') || cat.textContent
        );
        
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
      const blogPath = `${basePath}/data/blog.json`;
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

export const initPostEnhancements = () => {
  const post = document.querySelector('.post-content');
  const tocList = document.querySelector('[data-post-toc-list]');
  const tocMobileList = document.querySelector('[data-post-toc-list-mobile]');
  const tocDesktopBtn = document.querySelector('[data-toc-desktop-btn]');
  const tocDesktopDrawer = document.querySelector('[data-toc-desktop-drawer]');
  const tocDesktopOverlay = document.querySelector('[data-toc-desktop-overlay]');
  const tocDesktopClose = document.querySelector('[data-toc-desktop-close]');
  const tocMobileBtn = document.querySelector('[data-toc-mobile-btn]');
  const tocMobileDrawer = document.querySelector('[data-toc-mobile-drawer]');
  const tocMobileOverlay = document.querySelector('[data-toc-mobile-overlay]');
  const tocMobileClose = document.querySelector('[data-toc-mobile-close]');
  const shareCopyBtn = document.querySelector('[data-share-copy]');
  const shareStatusNode = document.querySelector('[data-share-status]');

  if (!post) {
    if (shareCopyBtn) {
      shareCopyBtn.addEventListener('click', () => {
        window.location.assign(shareCopyBtn.dataset.shareUrl || window.location.href);
      });
    }
    return;
  }

  const headings = Array.from(post.querySelectorAll('h2, h3')).filter((heading) =>
    heading.textContent.trim().length
  );

  if (!tocList) return;

  if (headings.length === 0) {
    if (tocMobileBtn) tocMobileBtn.setAttribute('hidden', '');
    if (tocDesktopBtn) tocDesktopBtn.setAttribute('hidden', '');
    return;
  }

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';

  const usedIds = new Set(
    Array.from(post.querySelectorAll('[id]'))
      .map((node) => node.id)
      .filter(Boolean)
  );

  headings.forEach((heading) => {
    if (!heading.id) {
      const baseId = slugify(heading.textContent);
      let uniqueId = baseId;
      let suffix = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${baseId}-${suffix}`;
        suffix += 1;
      }
      heading.id = uniqueId;
      usedIds.add(uniqueId);
    }
  });

  const createTocItem = (heading) => {
    const level = heading.tagName === 'H3' ? 3 : 2;
    const li = document.createElement('li');
    li.className = `post-toc__item post-toc__item--level-${level}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    link.dataset.tocLink = heading.id;
    li.appendChild(link);
    return li;
  };

  // Populate desktop TOC
  if (tocList) {
    const fragment = document.createDocumentFragment();
    headings.forEach((heading) => {
      fragment.appendChild(createTocItem(heading));
    });
    tocList.innerHTML = '';
    tocList.appendChild(fragment);
  }

  // Populate mobile TOC
  if (tocMobileList) {
    const mobileFragment = document.createDocumentFragment();
    headings.forEach((heading) => {
      mobileFragment.appendChild(createTocItem(heading));
    });
    tocMobileList.innerHTML = '';
    tocMobileList.appendChild(mobileFragment);
  }

  if (tocMobileBtn) {
    tocMobileBtn.removeAttribute('hidden');
  }
  if (tocDesktopBtn) {
    tocDesktopBtn.removeAttribute('hidden');
  }

  // Get all TOC links (both desktop and mobile)
  const allLinks = [
    ...(tocList ? tocList.querySelectorAll('a[data-toc-link]') : []),
    ...(tocMobileList ? tocMobileList.querySelectorAll('a[data-toc-link]') : [])
  ];

  const setActiveLink = (id) => {
    allLinks.forEach((link) => {
      if (link.dataset.tocLink === id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0
    }
  );

  headings.forEach((heading) => observer.observe(heading));

  // Desktop drawer functionality
  const openDesktopDrawer = () => {
    if (tocDesktopDrawer) {
      tocDesktopDrawer.removeAttribute('hidden');
      tocDesktopDrawer.setAttribute('data-toc-desktop-open', '');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDesktopDrawer = () => {
    if (tocDesktopDrawer) {
      tocDesktopDrawer.removeAttribute('data-toc-desktop-open');
      document.body.style.overflow = '';
      // Wait for animation to complete before hiding
      setTimeout(() => {
        if (!tocDesktopDrawer.hasAttribute('data-toc-desktop-open')) {
          tocDesktopDrawer.setAttribute('hidden', '');
        }
      }, 200);
    }
  };

  if (tocDesktopBtn) {
    tocDesktopBtn.addEventListener('click', openDesktopDrawer);
  }

  if (tocDesktopClose) {
    tocDesktopClose.addEventListener('click', closeDesktopDrawer);
  }

  if (tocDesktopOverlay) {
    tocDesktopOverlay.addEventListener('click', closeDesktopDrawer);
  }

  // Close desktop drawer when clicking on a TOC link
  if (tocList) {
    tocList.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-toc-link]');
      if (link) {
        // Small delay to allow smooth scroll
        setTimeout(() => {
          closeDesktopDrawer();
        }, 100);
      }
    });
  }

  // Mobile drawer functionality
  const openMobileDrawer = () => {
    if (tocMobileDrawer) {
      tocMobileDrawer.removeAttribute('hidden');
      tocMobileDrawer.setAttribute('data-toc-mobile-open', '');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeMobileDrawer = () => {
    if (tocMobileDrawer) {
      tocMobileDrawer.removeAttribute('data-toc-mobile-open');
      document.body.style.overflow = '';
      // Wait for animation to complete before hiding
      setTimeout(() => {
        if (!tocMobileDrawer.hasAttribute('data-toc-mobile-open')) {
          tocMobileDrawer.setAttribute('hidden', '');
        }
      }, 200);
    }
  };

  if (tocMobileBtn) {
    tocMobileBtn.addEventListener('click', openMobileDrawer);
  }

  if (tocMobileClose) {
    tocMobileClose.addEventListener('click', closeMobileDrawer);
  }

  if (tocMobileOverlay) {
    tocMobileOverlay.addEventListener('click', closeMobileDrawer);
  }

  // Close mobile drawer when clicking on a TOC link
  if (tocMobileList) {
    tocMobileList.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-toc-link]');
      if (link) {
        // Small delay to allow smooth scroll
        setTimeout(() => {
          closeMobileDrawer();
        }, 100);
      }
    });
  }

  // Close mobile drawer on Escape key (only if desktop drawer is not open)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (tocMobileDrawer?.hasAttribute('data-toc-mobile-open')) {
        closeMobileDrawer();
      } else if (tocDesktopDrawer?.hasAttribute('data-toc-desktop-open')) {
        closeDesktopDrawer();
      }
    }
  });

  if (shareCopyBtn) {
    const shareUrl = shareCopyBtn.dataset.shareUrl || window.location.href;
    const defaultLabel = shareCopyBtn.textContent;

    const writeToClipboard = async (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textarea);
      }
      return Promise.resolve();
    };

    shareCopyBtn.addEventListener('click', async () => {
      try {
        await writeToClipboard(shareUrl);
        shareCopyBtn.textContent = 'Link copied';
        if (shareStatusNode) {
          shareStatusNode.textContent = 'Copied to clipboard.';
        }
        setTimeout(() => {
          shareCopyBtn.textContent = defaultLabel;
          if (shareStatusNode) {
            shareStatusNode.textContent = '';
          }
        }, 2500);
      } catch (error) {
        console.warn('Share copy failed', error);
        if (shareStatusNode) {
          shareStatusNode.textContent = 'Could not copy automatically. Please copy the address bar.';
        }
      }
    });
  }
};

export const initBlogSort = () => {
  const blogFeed = document.getElementById('blog-feed');
  if (!blogFeed) return;

  const sortButtons = Array.from(document.querySelectorAll('[data-sort]'));
  if (sortButtons.length === 0) return;

  const sortPosts = (order) => {
    try {
      // Re-query posts each time to ensure we have fresh references
      const posts = Array.from(blogFeed.querySelectorAll('[data-blog-post]'));
      if (posts.length === 0) return;

      // Store empty message if it exists (before clearing)
      const emptyMessage = blogFeed.querySelector('.blog-feed__empty');

      const sorted = posts.slice().sort((a, b) => {
        const dateA = new Date(a.dataset.published || 0).getTime();
        const dateB = new Date(b.dataset.published || 0).getTime();
        
        if (order === 'oldest') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });

      // Clear and re-append in sorted order
      blogFeed.innerHTML = '';
      sorted.forEach(post => {
        blogFeed.appendChild(post);
      });
      
      // Re-append empty message if it existed
      if (emptyMessage) {
        blogFeed.appendChild(emptyMessage);
      }
      
      blogFeed.dataset.blogSort = order;
    } catch (error) {
      console.error('Blog sort: Error in sortPosts', error);
    }
  };

  // Update button states
  const updateButtons = (activeSort) => {
    sortButtons.forEach(btn => {
      const sortValue = btn.dataset.sort;
      if (sortValue === activeSort) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  };

  // Handle button clicks
  sortButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sortValue = btn.dataset.sort;
      if (sortValue === 'newest' || sortValue === 'oldest') {
        sortPosts(sortValue);
        updateButtons(sortValue);
      }
    });
  });

  // Initialize with current sort order
  const currentSort = blogFeed.dataset.blogSort || 'newest';
  sortPosts(currentSort);
  updateButtons(currentSort);
};
