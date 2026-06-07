import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const contentDirs = ['_posts', '_tutorials'];
const replacementChar = '\uFFFC';
const rawDisplayMathPattern =
  /^(?:[A-Z]\(|[a-zA-Z]+_\\|[A-Z]\s*=|\\begin\{|\\sum|\\frac|\\theta\b)/;
const requiredFields = ['title', 'date', 'author'];
const summaryFields = ['subtitle', 'description'];
const errors = [];

const splitFrontMatter = (source) => {
  if (!source.startsWith('---\n')) return { frontMatter: '', body: source };
  const end = source.indexOf('\n---', 4);
  if (end === -1) return { frontMatter: '', body: source };
  return {
    frontMatter: source.slice(4, end),
    body: source.slice(end + 4)
  };
};

const hasFrontMatterField = (frontMatter, field) =>
  new RegExp(`^${field}:\\s*\\S`, 'm').test(frontMatter);

const isInsideFence = (line, state) => {
  if (/^\s*(```|~~~)/.test(line)) {
    state.inFence = !state.inFence;
    return true;
  }
  return state.inFence;
};

const isMathDelimiter = (trimmed) =>
  trimmed === '$$' || trimmed === '\\[' || trimmed === '\\]';

const isHtmlMathStart = (trimmed) =>
  trimmed.includes('class="math display"') && trimmed.includes('\\[');

const isHtmlMathEnd = (trimmed) => trimmed.includes('\\]</span>');

const checkContentFile = (dir, file) => {
  const path = join(dir, file);
  const source = readFileSync(path, 'utf8');
  const { frontMatter, body } = splitFrontMatter(source);

  if (!frontMatter) {
    errors.push(`${path}: missing YAML front matter.`);
    return;
  }

  requiredFields.forEach((field) => {
    if (!hasFrontMatterField(frontMatter, field)) {
      errors.push(`${path}: missing front matter field "${field}".`);
    }
  });

  if (!summaryFields.some((field) => hasFrontMatterField(frontMatter, field))) {
    errors.push(`${path}: add either "subtitle" or "description" front matter.`);
  }

  if (source.includes(replacementChar)) {
    errors.push(`${path}: contains hidden object replacement character.`);
  }

  const h1Count = body.split('\n').filter((line) => /^#\s+/.test(line)).length;
  if (h1Count > 0) {
    errors.push(`${path}: body contains markdown H1; start body headings at ##.`);
  }

  const state = { inFence: false, inMath: false };
  body.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (isInsideFence(line, state)) return;
    if (isHtmlMathStart(trimmed)) {
      state.inMath = !isHtmlMathEnd(trimmed);
      return;
    }
    if (isMathDelimiter(trimmed)) {
      state.inMath = !state.inMath;
      return;
    }
    if (state.inMath) {
      if (isHtmlMathEnd(trimmed)) state.inMath = false;
      return;
    }
    if (trimmed === '' || trimmed.startsWith('|')) return;

    if (rawDisplayMathPattern.test(trimmed) && /\\|[_^{}<>]/.test(trimmed)) {
      errors.push(`${path}:${index + 1}: likely raw TeX outside math delimiters.`);
    }
  });
};

contentDirs.forEach((dir) => {
  readdirSync(dir)
    .filter((file) => file.endsWith('.md') || file.endsWith('.markdown'))
    .forEach((file) => checkContentFile(dir, file));
});

if (errors.length > 0) {
  console.error('Post publishing checks failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Post publishing checks passed.');
