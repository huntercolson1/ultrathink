# huntercolson.dev

This repository contains the source for [huntercolson.dev](https://huntercolson.dev), Hunter Colson's personal website.

The site is a static Jekyll project. There is no application backend or database; Jekyll turns the Markdown, layouts, data files, CSS, JavaScript, and assets in this repository into the public site.

## What Is Here

- Essays, posts, and tutorials written in Markdown.
- Jekyll layouts and includes that define the site structure.
- Small browser scripts for navigation, search/filtering, table-of-contents behavior, and homepage interactions.
- Site styles, fonts, icons, downloads, and article figures.
- Lightweight validation scripts for checking posts and front-end code.

## Repository Map

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

## Local Inspection

To run the site locally:

```bash
npm install
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Then open `http://127.0.0.1:4000`.

Local dependency folders such as `vendor/bundle`, `.bundle`, and generated build output are ignored by git.

## Checks

Useful checks for the source:

```bash
npm run prepublish:posts
npm test
bundle exec jekyll build
```
