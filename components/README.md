# Components

Each HTML snippet inside this directory is atomic and portable. Components only rely on design tokens declared in `css/theme.css` and optional data attributes.

| Component | Hook | Notes |
|-----------|------|-------|
| `header.html` | `data-component="nav scroll-header"` | Fixed masthead with integrated nav + drawer |
| `nav.html` | `data-component="nav"` | Standalone nav bar for alternate layouts |
| `footer.html` | _none_ | Symmetric footer with utility links |
| `card.html` | n/a | Generic card block used for Tutorials/Blog |
| `section.html` | `data-section-tone` | Wraps sections with consistent spacing and background tone |
| `list.html` | `data-component="dataset"` | Auto-populates from JSON feed to create quick-link lists |

### JS data hooks

- `data-component="nav"` turns on the mobile drawer + skip-link behavior.
- `data-nav-toggle` and `data-nav-drawer` link toggles to the drawer panel.
- `data-component="dataset"` requires:
  - `data-source="/data/tutorials.json"` (path to JSON array)
  - `data-template="card|list"` (rendering template)
  - `data-limit="3"` (optional)
- `data-component="stats"` expects children with `data-target-value="42"` to animate counts.

You can copy these snippets directly into any page or use Jekyll/GitHub Pages includes (e.g. `{% include_relative components/header.html %}`) while keeping markup identical across the system.
