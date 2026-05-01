## Learned User Preferences

- Dislikes em dashes in writing; replace with colons, periods, or restructured sentences
- Prefers contractions (isn't, doesn't, don't) over formal forms (is not, does not)
- Writing should sound natural and human, not AI-generated; avoid buzzwords and dramatic headers
- Prefers simple, patient, explanatory prose for med students and learners; long-winded over terse
- No unnecessary UI features (subscribe buttons, filler headings like "Essays & Notes"); when polishing the frontend, prefers subtraction and tightening over adding new features
- Design should be function-first. Every element must justify its existence through purpose. Beauty emerges from function, not decoration. Strip anything that doesn't serve the user. Warm minimal luxury with restrained editorial cues
- Don't touch main branch unless explicitly asked; work on dev or in separate folders
- Uses pnpm as the package manager for Node projects
- Blog posts and tutorials should have consistent formatting (tables, blockquotes, headings); when auditing or polishing posts, visually inspect the rendered site so tables, charts, buttons, and embedded graphics match design tokens and the brand palette—not only markdown or docs in isolation
- Wants the site to read as painstakingly refined and expert-level (not generic); values consistent branding; prefers abstract or generative art for icons and marks over literal stock imagery
- UI work should include clean responsive behavior: polished transitions at breakpoints (including mobile collapse) and consistent interaction states across comparable controls
- Anthropic `frontend-design` skill is installed globally at `~/.cursor/skills/frontend-design/` for all Cursor workspaces

## Learned Workspace Facts

- The user frames the site's visual intent as **Kinoubi (機能美)** (functional beauty): refined form driven by purpose with ornament stripped to what serves use
- **`DESIGN-SYSTEM.md`** describes intent; **enforced** typography and colors live in `hunter-shadcn-site/app/globals.css` (`:root` + utilities like `text-body`, `text-title-h1`) and `hunter-shadcn-site/lib/chart-typography.ts` for chart SVG sizes. New UI must use those, not ad hoc `rem` classes.
- Static Jekyll blog at repo root with content in `_posts/`, `_tutorials/`, `_data/`
- `hunter-shadcn-site/` is the Next.js 16 rebuild using shadcn (radix-nova style, Tailwind v4, pnpm)
- `shadcn-preview/` is an older Vite-based prototype (may contain uncommitted experiments)
- shadcn preset code is `bJMSkkb2`; installed via `pnpm dlx shadcn@latest`
- Next.js site reads content from root-level `_posts/`, `_tutorials/`, `_data/about.yml`
- SVG charts need separate light and dark variants using `theme-asset--light`/`theme-asset--dark` CSS classes
- Jekyll dev server runs on port 4000; Next.js dev server runs on port 3000
- OKLCH palette: near-neutral surfaces and text; **accent-warm / accent-sage / accent-blue** carry restrained chroma for links, data series, and focus (see `DESIGN-SYSTEM.md`)
- `.cursor/mcp.json` at repo root configures shadcn MCP with cwd pointing to the active project
