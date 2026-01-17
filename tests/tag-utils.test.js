import assert from 'node:assert/strict';
import { normalizeTag, normalizeTags } from '../js/utils/tag-utils.js';

assert.equal(normalizeTag(' AI '), 'ai');
assert.equal(normalizeTag('#Claude'), 'claude');
assert.equal(normalizeTag('medical-education'), 'medical-education');
assert.equal(normalizeTag(''), null);
assert.equal(normalizeTag(null), null);

const normalized = normalizeTags(['AI', 'ai', '  Ai  ', '#ai', 'data-science', '']);
assert.deepEqual(normalized, ['ai', 'data-science']);

console.log('tag-utils.test.js passed');
