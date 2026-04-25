# ULTRATHINK Design System

ULTRATHINK should feel like a personal lab notebook: monochrome, precise, curious, and a little playful. It should not feel like a generic portfolio, startup landing page, or AI-generated interface.

## Core Rules

- Keep the palette black, white, and gray. Use contrast, spacing, rules, and motion before adding color.
- Use the dot grid as the environmental texture, not as decoration to fill empty space.
- Prefer sharp edges, thin rules, mono labels, and large restrained display type.
- Use interactions as affordances: drag, hover, active index states, and subtle cursor response should make the site feel alive without becoming a toy.
- Do not add explanatory UI copy when a label, state, or interaction can make the intent clear.

## Spacing

- Page starts use `--space-page`.
- Major content groups use `--space-section`.
- Feed/list rows use `--space-row`.
- Article bodies should stay readable: `--container-article`.
- Listing pages should stay tighter than the homepage and should use `--container-readable`.

## Type

- Display titles are uppercase, tight, and confident, but should not overwhelm browse surfaces.
- Blog and tutorial listing titles should be scannable, not hero-sized.
- Post titles should top out around a strong editorial scale, not the full homepage hero scale.
- Mono metadata should be small, tabular, and quiet.

## Indexes

- Desktop article indexes are permanent side rails.
- Mobile article indexes collapse into a floating `INDEX` control.
- Index styling should be line-based and integrated with the grid, not card-heavy.

## Motion

- Motion should feel authored and physical.
- Scramble effects should be short, legible, and settle quickly.
- Respect `prefers-reduced-motion`.
- Preserve native browser scroll, overscroll, and mobile pull-to-refresh.
