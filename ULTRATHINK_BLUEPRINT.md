# Ultrathink Website Rebuild — Technical Blueprint

## 1. Objectives
- Replace the current Jekyll theme with a ground-up, monochrome system that feels engineered rather than themed.
- Keep the surface area pure static (HTML/CSS/ES modules) so GitHub Pages can build and host without servers or heavy frameworks.
- Preserve existing content pillars (Series, Blog, Projects, About) while making the layout modular enough to add research notes or tooling without rework.
- Bake in accessibility, performance, and testability targets (≥95 Lighthouse, WCAG AA contrast, zero console errors).

## 2. Guiding Principles
- **Minimal + Intentional**: Only black/white/grey palette, typography-driven hierarchy, no gratuitous gradients or emojis.
- **Composable System**: Every UI element lives in `/components`, scoped styles reside in `components.css`, and JS hooks live alongside the component logic.
- **Tokenized Styling**: Colors, spacing, and typography flow from CSS custom properties defined once in `theme.css`.
- **Fluid Responsiveness**: Layouts degrade gracefully from ≥1440px ultrawide down to ≤360px mobile without snapping or dead zones.
- **Documented rigor**: Each layer (HTML, CSS, JS) has lint + validation plus a deployment checklist documented in-repo.

## 3. Technical Stack & Tooling

### 3.1 Core stack
- **HTML5** with semantic regions (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **CSS** compiled from SCSS via `dart-sass` for nesting + variables; output is modular CSS files in `/css`.
- **Vanilla ES Modules** for interactions (`import { initNav } from './ui.js';`). No bundler required; native module support is enough for modern browsers.
- **Font**: _Space Grotesk_ (local w/ `@font-face`, woff2 served from `/assets/fonts`).

### 3.2 Build + deployment
- NPM scripts orchestrate linting + CSS compilation. No transpilation for JS.
- GitHub Pages serves directly from `main` branch root.

```jsonc
{
  "scripts": {
    "dev": "sass --watch css:css --style=expanded",
    "build:css": "sass css:css --style=compressed",
    "lint:css": "stylelint \"css/**/*.css\"",
    "lint:js": "eslint \"js/**/*.js\"",
    "test": "npm run lint:css && npm run lint:js",
    "deploy": "npm run build:css && npm run test"
  }
}
```

### 3.3 Directory map

```
project-root
├── index.html
├── pages/                  # About, Series, Blog, Projects landing
├── css/
│   ├── base.css            # Normalize + typography primitives
│   ├── layout.css          # Grid + container utilities
│   ├── components.css      # Atomic component styles (BEM-like)
│   ├── utilities.css       # Helpers (flow spacing, hide, text trims)
│   └── theme.css           # Tokens: colors, spacing, font stacks
├── js/
│   ├── main.js             # Bootstraps modules on DOMContentLoaded
│   ├── ui.js               # Nav, menu toggles, focus traps
│   ├── components.js       # Component registry + lazy init
│   └── utils.js            # DOM/query helpers, debounce
├── components/
│   ├── header.html
│   ├── nav.html
│   ├── footer.html
│   ├── section.html
│   ├── card.html
│   └── list.html
├── data/
│   ├── series.json         # Title, summary, url, status
│   ├── blog.json           # For featured posts module
│   └── projects.json
├── assets/
│   ├── img/
│   ├── fonts/
│   └── icons/
└── tools/
    └── validate.sh         # Runs lint + htmlhint before commit
```

> The `/components` folder doubles as documentation: each file includes the HTML snippet, required classes, and optional `data-*` hooks for JS modules. Pages import components with standard HTML copy/paste or Jekyll includes (`{% include_relative components/header.html %}`) if templating is desired.

## 4. Layout & Content Model

### 4.1 Page templates
- **Home (`index.html`)**: Fixed nav, hero intro, three-up resource rail (Series, Blog, Projects), featured research block, CTA strip, footnotes.
- **Series landing (`pages/series.html`)**: Filterable list grouped by topic; uses cards with metadata rows (format, duration, updated).
- **Blog landing**: Chronological feed with excerpt length capped to 75 chars width; uses `article-card` component.
- **Project index**: Grid of case-study cards (title, stack, status, CTA).
- **Article page**: Typographic template with `reading-progress` indicator and accessible TOC.
- **About**: Split layout (profile + story, timeline of milestones).

### 4.2 Grid + spacing system
- Max width `1200px`, padded via `--space-lg` on desktop and `--space-md` on mobile.
- `layout.css` defines:
  - `.grid` utility with CSS custom props for columns/gap.
  - `.stack` utility using `display:flex; flex-direction:column; gap: var(--gap, var(--space-md));`.
  - `.cluster` for inline pill groupings.
- Breakpoints (CSS custom media):
  ```css
  @custom-media --mobile (max-width: 600px);
  @custom-media --tablet (min-width: 601px) and (max-width: 1024px);
  @custom-media --desktop (min-width: 1025px);
  @custom-media --ultra (min-width: 1440px);
  ```

## 5. Design Tokens (`theme.css`)

```css
:root {
  --black: #000;
  --white: #fff;
  --grey-1: #111;
  --grey-2: #222;
  --grey-3: #444;
  --grey-4: #888;

  --font-sans: "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif;
  --line-body: 1.5;

  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;

  --transition-fast: 150ms ease;
  --transition-med: 200ms ease;
}
```

Dark/light variants remain monochrome by inverting background + text tokens only (`data-theme="light"` on `<html>` toggles CSS variables).

## 6. CSS Architecture
- **`base.css`**: Eric Meyer reset + base typography (`body`, `h1–h6`, `p`, `a`, `button`). Always load first.
- **`layout.css`**: Containers (`.container`, `.section`), grid utilities, responsive spacing rules. No component-specific styles.
- **`components.css`**: BEM-style rules (`.c-card`, `.c-card__meta`, `.c-nav__toggle`). Each block grouped with a leading comment header for quick reference.
- **`utilities.css`**: Single-purpose classes (`.u-text-muted`, `.u-hide-mobile`, `.u-flow-lg`).
- **`theme.css`**: tokens + media queries; imported before others so downstream files can override.

Loading order in HTML:
```html
<link rel="stylesheet" href="/css/theme.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="stylesheet" href="/css/utilities.css">
```

## 7. Component Library

| Component | Purpose | Notes |
|-----------|---------|-------|
| `header` | Fixed top bar hosting brand mark + nav trigger; 64px height | Transparent by default, switches to `rgba(0,0,0,0.85)` after 40px scroll. |
| `nav` | Primary navigation with mobile drawer | Drawer uses `prefers-reduced-motion` guard; trap focus while open. |
| `footer` | Symmetric layout w/ quick links + contact | Mirror spacing of header, anchored typography. |
| `card` | Reusable block for Series/Blog/Project items | `data-card-size="md|lg"` toggles padding + font scale. |
| `section` | Wrapper establishing spacing rhythm | Accepts `data-section-tone="surface|sunken"` to adjust grey backgrounds. |
| `button` | Minimal pill w/ outline + subtle inset shadow | `--btn-height` custom property for flexible sizing. |
| `stat` | Numeric highlight for metrics | Animates count via `IntersectionObserver`. |
| `list` | Definition-style listing for quick links | Handles both inline + stacked variants. |

Each component HTML includes:
1. Required structure (using `.c-*` naming).
2. Optional modifiers (BEM `--compact`, `--raised`).
3. `data-js` hooks for initialization (e.g., `data-js="nav-toggle"`).

Component documentation lives as HTML comments at top of each file plus a short Markdown snippet in `components/README.md`.

## 8. JavaScript Modules

### `utils.js`
- Helpers: `qs(selector, scope)`, `qsa`, `trapFocus(container)`, `lockScroll(state)`, `prefersReducedMotion()`, `createObserver(options)`.

### `components.js`
- Registry pattern:
  ```js
  const registry = {
    nav: initNav,
    accordion: initAccordion,
    progress: initProgress
  };
  export function initComponents() {
    document.querySelectorAll('[data-component]').forEach((el) => {
      const key = el.dataset.component;
      if (registry[key]) registry[key](el);
    });
  }
  ```

### `ui.js`
- `initNav()` handles desktop hover + mobile drawer, ensures transitions ≤200ms.
- `initScrollHeader()` toggles header background after scroll threshold.
- `initSkipLinks()` ensures keyboard users can bypass nav.
- `initThemeToggle()` flips `data-theme` attribute (still grayscale).

### `main.js`
- Entry point; waits for `DOMContentLoaded`, loads fonts via `FontFaceSet.load`, then calls `initComponents()` and attaches passive scroll listeners only when needed.

No global frameworks; everything is tree-shakeable ES modules.

## 9. Accessibility & Motion
- **Contrast**: Use `--white` text on `--grey-1` backgrounds and `--grey-2` on `--white` to maintain ≥7:1 ratio.
- **Focus states**: Visible focus ring (`outline: 2px solid var(--grey-4); outline-offset: 2px;`) independent of hover states.
- **Reduced motion**: Wrap any CSS transitions/animations in `@media (prefers-reduced-motion: no-preference)`.
- **Keyboard nav**: Mobile drawer uses focus trap + `Esc` close. Skip links appear on focus.
- **ARIA**: `aria-expanded` on nav toggles, `aria-current` on active nav, `aria-label` for icon-only buttons.

## 10. Performance Budget
- Target < 50KB CSS total, < 30KB JS (unminified). Images optimized (AVIF/WEBP) ≤ 200KB hero.
- Preload fonts (`<link rel="preload" as="font">`), serve local `.woff2` only.
- Use `loading="lazy"` on all non-hero images.
- Inline critical CSS (~6kb) for above-the-fold sections if needed.

## 11. Testing & Validation
- **HTML**: `htmlhint "**/*.html"` run via `tools/validate.sh`.
- **CSS/JS**: Stylelint + ESLint as noted in scripts.
- **Accessibility**: `npx pa11y http://localhost:4000` or Playwright axe integration.
- **Performance**: Lighthouse CI script (`npm run lhci`) optional.
- **Responsiveness**: Add Percy (or Chromatic alt) visual snapshots at breakpoints 360/768/1024/1440.

## 12. Migration Plan
1. **Content extraction**: Export existing Jekyll Markdown for Blog/Series/Projects into `/data/*.json` (for summary cards) plus `/pages/*.html` for canonical pages.
2. **Asset sanitization**: Move any used imagery into `/assets/img`; convert to monochrome/greyscale.
3. **Component build-out**: Start with header/nav/footer skeleton, then hero + card components. Wire tokens early so future sections inherit.
4. **Page assembly**: Compose `index.html` using new sections, then replicate patterns across `pages/`.
5. **JS enhancements**: Layer nav interactions, reading progress, and IntersectionObserver effects only after layout is stable.
6. **QA + lint**: Run validation scripts, address regressions, then push to `main`.

## 13. Execution Timeline (suggested)
- **Day 1**: Set up repo scaffolding, tokens, typography, base layout.
- **Day 2**: Build header/nav/footer, hero, resource cards, CTA components; wire JS for nav.
- **Day 3**: Assemble inner pages (Series/Blog/Projects/About), integrate datasets.
- **Day 4**: Accessibility + performance polish, add tests + documentation, prep deployment checklist.

## 14. Deliverables Checklist
- [ ] New folder structure with placeholder files per map above.
- [ ] `components/README.md` describing usage + modifiers.
- [ ] `stylelint.config.cjs` + `eslint.config.js` tuned for vanilla stack.
- [ ] `tools/validate.sh` script.
- [ ] Updated `README.md` explaining build, lint, deploy steps for GitHub Pages.
- [ ] Lighthouse + Pa11y reports stored in `/reports` (optional but recommended).

This blueprint keeps the system monochrome, modular, and purpose-built for GitHub Pages while leaving enough structure to evolve into additional research tooling later. Use it as the contract for implementation before moving pixels.
