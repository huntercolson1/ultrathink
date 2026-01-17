import assert from 'node:assert/strict';
import { buildTagIndex, filterPostsByTag } from '../js/utils/tag-utils.js';

const posts = [
  {
    title: 'Post One',
    date: '2025-01-01',
    slug: 'post-one',
    url: '/posts/post-one/',
    excerpt: 'First post.',
    tags: ['AI', 'Research', 'ai']
  },
  {
    title: 'Post Two',
    date: '2025-02-01',
    slug: 'post-two',
    url: '/posts/post-two/',
    excerpt: 'Second post.',
    tags: ['research', 'data-science']
  },
  {
    title: 'Post Three',
    date: '2025-03-01',
    slug: 'post-three',
    url: '/posts/post-three/',
    excerpt: 'Third post.',
    tags: ['medical-education', 'Data-Science', '']
  }
];

const index = buildTagIndex(posts);

assert.equal(index.ai.count, 1);
assert.equal(index.research.count, 2);
assert.equal(index['data-science'].count, 2);
assert.equal(index['medical-education'].count, 1);

assert.equal(index.research.posts.length, 2);
assert.equal(index['data-science'].posts[0].title, 'Post Two');

const filtered = filterPostsByTag(posts, 'DATA-science');
assert.equal(filtered.length, 2);
assert.equal(filterPostsByTag(posts, '').length, 3);

console.log('tag-index.test.js passed');
