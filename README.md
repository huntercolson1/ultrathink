# Hunter — Research & Notes

A minimalist, professional Jekyll site using **Just the Docs** with dark mode, a collapsible sidebar, and a modular design system.

## Local development
1. Install Ruby (3.x) and Bundler.
2. Install deps:
   ```bash
   bundle install
   ```

3. Run:

   ```bash
   bundle exec jekyll serve
   ```
4. Open [http://localhost:4000](http://localhost:4000)

## GitHub Pages

This repo is Pages-compatible. When ready, set your repository’s Pages settings to build from the default branch.
We use only supported plugins (`jekyll-remote-theme`, `jekyll-seo-tag`, `jekyll-sitemap`) and `remote_theme: just-the-docs/just-the-docs`.

## Structure

* `_series/` — series content included in sidebar
* `_blog/` — blog posts (collection)
* `projects/` — projects landing
* `assets/` — images, CSS, JS
* `_sass/` — theme tokens, schemes, and overrides
* `_includes/components/` — reusable UI pieces

## Design principles

* Comfortable reading measure (~45–85 characters)
* WCAG AA contrast targets (4.5:1+ body text)
* System-UI sans stack by default; easy to swap later

