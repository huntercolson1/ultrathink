# Hunter — Research & Notes

A minimalist, professional Jekyll blog optimized for **GitHub Pages**. Built with Just the Docs theme.

## 🚀 GitHub Pages Deployment

**This site is 100% ready for GitHub Pages!**

### Quick Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Source: `main` branch, `/ (root)` folder
   - Click **Save**

3. **Your site will be live at:** `https://YOUR_USERNAME.github.io/hunter-site/`

📖 **Full deployment guide:** See [GITHUB_PAGES.md](GITHUB_PAGES.md)

## ✅ GitHub Pages Compatibility

- ✅ Uses `github-pages` gem (official GitHub Jekyll version)
- ✅ Only GitHub Pages whitelisted plugins
- ✅ Remote theme: Just the Docs
- ✅ Collections properly configured
- ✅ SEO and sitemap plugins included

## 🖥️ Local Development

### Option 1: Docker (Recommended)

```bash
docker run -it --rm \
  -v "$PWD":/srv/jekyll \
  -p 4000:4000 \
  jekyll/jekyll:4.3 \
  jekyll serve --host 0.0.0.0 --force_polling
```

Then open [http://localhost:4000](http://localhost:4000)

### Option 2: Local Ruby (if Ruby 3.2-3.3 available)

```bash
bundle install
bundle exec jekyll serve
```

For troubleshooting, see [SETUP.md](SETUP.md)

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

