import { qs } from './utils.js';
import {
  initNav,
  initScrollHeader,
  initThemeToggle,
  initStats,
  initBlogFilter,
  initSearch
} from './ui.js';

const registry = {
  nav: initNav,
  'scroll-header': initScrollHeader,
  'theme-toggle': initThemeToggle,
  stats: initStats,
  'blog-filter': initBlogFilter,
  search: initSearch,
  dataset: initDataset
};

const dataCache = new Map();

async function fetchDataset(path) {
  if (dataCache.has(path)) return dataCache.get(path);
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  const json = await response.json();
  dataCache.set(path, json);
  return json;
}

function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'c-card';
  card.innerHTML = `
    <div class="c-card__meta">
      <span>${item.type ?? 'Entry'}</span>
      <span>${item.updated ?? ''}</span>
    </div>
    <h3 class="c-card__title">${item.title}</h3>
    <p class="c-card__desc">${item.summary ?? ''}</p>
    <div class="c-card__actions">
      <a class="c-btn c-btn--ghost" href="${item.url}" aria-label="${
        item.title
      }">Access →</a>
    </div>
  `;
  return card;
}

function buildListItem(item) {
  const row = document.createElement('div');
  row.className = 'c-list__item';
  row.innerHTML = `
    <div>
      <p class="c-list__title">${item.title}</p>
      <p class="u-text-muted">${item.summary ?? ''}</p>
    </div>
    <a class="u-text-contrast" href="${item.url}" aria-label="${
      item.title
    }">↗</a>
  `;
  return row;
}

async function initDataset(node) {
  const source = node.dataset.source;
  const template = node.dataset.template ?? 'card';
  const limit = Number(node.dataset.limit) || 6;

  if (!source) return;
  try {
    const data = await fetchDataset(source);
    const fragment = document.createDocumentFragment();
    data.slice(0, limit).forEach((item) => {
      const element = template === 'list' ? buildListItem(item) : buildCard(item);
      fragment.appendChild(element);
    });
    node.innerHTML = '';
    node.appendChild(fragment);
  } catch (error) {
    console.error(error);
    node.innerHTML =
      '<p class="u-text-muted">Unable to load data at the moment.</p>';
  }
}

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
