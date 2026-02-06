import { buildTagIndex, normalizeTag, normalizeTags } from './utils/tag-utils.js';

const TAG_PARAM = 'tag';

const getPostsData = () => {
  const dataNode = document.getElementById('blog-posts-data');
  if (!dataNode) return [];
  try {
    return JSON.parse(dataNode.textContent || '[]');
  } catch (error) {
    console.warn('Blog tags: Failed to parse posts data', error);
    return [];
  }
};

const getSelectedTag = () => {
  const params = new window.URLSearchParams(window.location.search);
  return normalizeTag(params.get(TAG_PARAM));
};

const updateUrl = (tag) => {
  const url = new window.URL(window.location.href);
  if (tag) {
    url.searchParams.set(TAG_PARAM, tag);
  } else {
    url.searchParams.delete(TAG_PARAM);
  }
  window.history.pushState({}, '', url);
};

const sortTags = (entries, mode) => {
  if (mode === 'alpha') {
    return entries.sort((a, b) => a[0].localeCompare(b[0]));
  }
  return entries.sort((a, b) => {
    const countDiff = b[1].count - a[1].count;
    if (countDiff !== 0) return countDiff;
    return a[0].localeCompare(b[0]);
  });
};

const normalizePostPath = (urlValue) => {
  if (!urlValue) return '';
  try {
    const parsed = new window.URL(urlValue, window.location.origin);
    const pathname = parsed.pathname || '';
    if (!pathname) return '';
    return pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
};

export const initBlogTags = () => {
  const panel = document.querySelector('[data-tag-panel]');
  if (!panel) return;

  const feed = document.getElementById('blog-feed');
  if (!feed) return;

  const tagList = panel.querySelector('[data-tag-list]');
  if (!tagList) return;
  const clearButton = panel.querySelector('[data-tag-clear]');
  const summaryNode = panel.querySelector('[data-tag-summary]');
  const sortButtons = Array.from(panel.querySelectorAll('[data-tag-sort]'));
  const emptyMessage = feed.querySelector('[data-blog-empty]');

  const postNodes = Array.from(feed.querySelectorAll('[data-blog-post]'));
  const postsData = getPostsData();
  const postsByPath = new Map();
  postsData.forEach((post) => {
    const path = normalizePostPath(post.url || post.slug || '');
    if (path) {
      postsByPath.set(path, post);
    }
  });

  const postItems = postNodes.map((node) => {
    const href =
      node.querySelector('a[href]')?.getAttribute('href') ||
      node.querySelector('a[href]')?.href ||
      '';
    const matchedPost = postsByPath.get(normalizePostPath(href));
    const domTags = normalizeTags((node.dataset.tags || '').split('|'));
    const tags = domTags.length ? domTags : normalizeTags(matchedPost?.tags || []);
    const publishedRaw = node.dataset.published || matchedPost?.date || '';
    const publishedAt = Number(new Date(publishedRaw));
    const title = node.querySelector('h2, h3, h4')?.textContent?.trim() || '';
    return {
      node,
      tags,
      title,
      date: publishedRaw,
      url: href,
      publishedAt: Number.isFinite(publishedAt) ? publishedAt : 0
    };
  });

  const tagIndex = buildTagIndex(postItems);

  let currentSort = 'count';
  let activeTag = getSelectedTag();

  const renderSummary = (visibleCount, totalCount) => {
    if (!summaryNode) return;
    if (!activeTag) {
      summaryNode.textContent = `${totalCount} posts · ${Object.keys(tagIndex).length} tags`;
      return;
    }
    summaryNode.textContent = `${visibleCount} posts tagged #${activeTag}`;
  };

  const updateEmptyState = (visibleCount) => {
    if (!emptyMessage) return;
    if (visibleCount === 0) {
      emptyMessage.hidden = false;
    } else {
      emptyMessage.hidden = true;
    }
  };

  const applyFilter = (tag) => {
    activeTag = normalizeTag(tag);
    const visibleItems = activeTag
      ? postItems.filter((item) => item.tags.includes(activeTag))
      : postItems.slice();

    visibleItems.sort((a, b) => b.publishedAt - a.publishedAt);
    const visibleNodes = new Set(visibleItems.map((item) => item.node));

    postItems.forEach((item) => {
      const matches = visibleNodes.has(item.node);
      item.node.hidden = !matches;
      item.node.setAttribute('aria-hidden', matches ? 'false' : 'true');
    });

    visibleItems.forEach((item) => {
      feed.appendChild(item.node);
    });

    const visibleCount = visibleItems.length;

    renderSummary(visibleCount, postItems.length);
    updateEmptyState(visibleCount);
    updateTagButtons();
    if (clearButton) {
      clearButton.disabled = !activeTag;
    }
  };

  const updateTagButtons = () => {
    const buttons = Array.from(tagList.querySelectorAll('button[data-tag]'));
    buttons.forEach((button) => {
      const value = button.dataset.tag || '';
      const normalized = normalizeTag(value);
      const isActive = (!activeTag && value === 'all') || (activeTag && normalized === activeTag);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderTags = () => {
    if (!tagList) return;
    tagList.innerHTML = '';

    const entries = sortTags(Object.entries(tagIndex), currentSort);
    const totalPosts = postItems.length;

    const allItem = document.createElement('li');
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = 'tag-pill';
    allButton.dataset.tag = 'all';
    allButton.setAttribute('aria-label', `Show all posts (${totalPosts})`);
    allButton.innerHTML = `<span>#all</span><span class="tag-pill__count">${totalPosts}</span>`;
    allItem.appendChild(allButton);
    tagList.appendChild(allItem);

    entries.forEach(([tag, data]) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tag-pill';
      button.dataset.tag = tag;
      button.setAttribute('aria-label', `Filter posts by tag ${tag} (${data.count})`);
      button.innerHTML = `<span>#${tag}</span><span class="tag-pill__count">${data.count}</span>`;
      item.appendChild(button);
      tagList.appendChild(item);
    });

    updateTagButtons();
  };

  const handleTagClick = (event) => {
    const button = event.target.closest('button[data-tag]');
    if (!button) return;
    const value = button.dataset.tag;
    if (value === 'all') {
      updateUrl(null);
      applyFilter(null);
      return;
    }
    const normalized = normalizeTag(value);
    if (!normalized) return;
    updateUrl(normalized);
    applyFilter(normalized);
  };

  const handleSort = (event) => {
    const button = event.target.closest('button[data-tag-sort]');
    if (!button) return;
    const mode = button.dataset.tagSort;
    if (!mode) return;
    currentSort = mode;
    sortButtons.forEach((btn) => {
      const isActive = btn.dataset.tagSort === mode;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    renderTags();
  };

  tagList.addEventListener('click', handleTagClick);

  sortButtons.forEach((button) => {
    button.addEventListener('click', handleSort);
  });

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      updateUrl(null);
      applyFilter(null);
    });
  }

  window.addEventListener('popstate', () => {
    applyFilter(getSelectedTag());
  });

  renderTags();
  applyFilter(activeTag);
};
