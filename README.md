# Hunter Site

This is Hunter Colson's personal Jekyll site for [huntercolson.dev](https://huntercolson.dev).

## Branches

- `main` is production. GitHub Pages serves this branch from the repository root.
- `dev` is the local/staging branch for drafts, experiments, and unpublished site work.
- Keep work-in-progress posts, scratch files, screenshots, generated assets, and local agent/tooling folders off `main`.

## Project Structure

```text
_config.yml        Jekyll configuration, collections, and build excludes
_data/             Site navigation and structured page data
_includes/         Shared Jekyll partials
_layouts/          Page and post layouts
_posts/            Published blog posts
_tutorials/        Published tutorials
assets/            Site fonts, downloads, icons, and post figures
css/               Site stylesheets
js/                Browser modules for navigation, filtering, TOC, and homepage effects
pages/             Top-level listing pages
tests/             JavaScript unit checks
tools/             Validation helpers
```

## Local Setup

```bash
npm install
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

`vendor/bundle` and `.bundle` are local Bundler output and should stay untracked.

## Validation

Before publishing post changes:

```bash
npm run prepublish:posts
```

Before pushing broader site changes:

```bash
npm test
bundle exec jekyll build
```

`npm run lint:html` is available for spot checks, but Jekyll/Liquid front matter can make it noisy. For post publishing, `npm run prepublish:posts` is the required gate.

## Publishing

1. Work on `dev` until the post or site change is ready.
2. Confirm front matter, heading levels, math delimiters, and rendered desktop/mobile layout.
3. Merge only intentional files to `main`.
4. Push `main`; GitHub Pages builds and deploys the live site.
