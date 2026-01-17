export const normalizeTag = (tag) => {
  if (typeof tag !== 'string') return null;
  const cleaned = tag.replace(/^#/, '').trim().toLowerCase();
  return cleaned.length ? cleaned : null;
};

export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  const unique = new Set();
  tags.forEach((tag) => {
    const normalized = normalizeTag(tag);
    if (normalized) {
      unique.add(normalized);
    }
  });
  return Array.from(unique);
};

export const buildTagIndex = (posts) => {
  const index = {};
  if (!Array.isArray(posts)) return index;

  posts.forEach((post) => {
    const normalizedTags = normalizeTags(post.tags || []);
    normalizedTags.forEach((tag) => {
      if (!index[tag]) {
        index[tag] = { count: 0, posts: [] };
      }
      index[tag].count += 1;
      index[tag].posts.push({
        title: post.title || '',
        date: post.date || '',
        slug: post.slug || post.url || '',
        excerpt: post.excerpt || '',
        url: post.url || ''
      });
    });
  });

  return index;
};

export const filterPostsByTag = (posts, tag) => {
  const normalized = normalizeTag(tag);
  if (!normalized) return posts || [];
  return (posts || []).filter((post) =>
    normalizeTags(post.tags || []).includes(normalized)
  );
};
