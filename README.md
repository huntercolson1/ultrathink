# Ultrathink — Monochrome Research System

Ultrathink is a black–white–grey website engineered for GitHub Pages. Every element is modular: tokens live in `css/theme.css`, HTML components live in `/components`, and lightweight ES modules power the micro-interactions.

## Stack & Structure

```
project-root
├── index.html
├── pages/                 # About, Series, Blog, Projects
├── components/            # Atomic HTML snippets + docs
├── css/                   # theme, base, layout, components, utilities
├── js/                    # utils, ui, components registry, main entry
├── data/                  # JSON feeds powering cards/lists
├── assets/fonts           # Space Grotesk self-hosted
├── tools/validate.sh      # Lint helper
└── .nojekyll              # Forces static hosting on GitHub Pages
```

## Commands

```bash
npm install          # install dev dependencies
npm run dev          # watch + compile CSS (if you add SCSS later)
npm run build:css    # one-off CSS build
npm run lint:css     # stylelint (BEM-friendly config)
npm run lint:js      # eslint (ES modules, browser globals)
npm run lint:html    # htmlhint
npm test             # runs all linters
./tools/validate.sh  # same as npm test (bash shortcut)
```

## Deployment

1. Commit + push to `main`.
2. In repository settings → Pages → Source: `main` /root.
3. GitHub Pages serves the static bundle. `.nojekyll` prevents the Ruby build.

## Design Principles

- **Palette**: `#000`, `#fff`, greys only.
- **Typography**: Space Grotesk, 1.4–1.6 line height, 60–75 character measure.
- **Layout**: CSS Grid/Flex hybrid with max width `1200px`.
- **Motion**: Sub-200ms transitions, respects `prefers-reduced-motion`.
- **Components**: BEM-like class names (`.c-card__title`, `.c-nav__toggle`), data hooks via `data-component`.
- **Accessibility**: High contrast, focus-visible states, skip links, keyboard-friendly drawer, aria attributes.

## Data-driven UI

JSON files in `/data` feed cards and lists. Any element with `data-component="dataset"` automatically fetches its source and renders cards (`data-template="card"`) or quick lists (`data-template="list"`). Stats blocks animate values with `data-target-value="42"`.

## Extending

- Add new pages within `/pages` by copying an existing shell.
- Drop new components into `/components` and document their modifiers.
- Update `data/*.json` to change homepage rails without touching markup.
- Run Lighthouse/Pa11y against `index.html` to keep performance ≥95 and accessibility at AA.

Everything is monochrome and intentional—treat it like an operating system, not a theme.
