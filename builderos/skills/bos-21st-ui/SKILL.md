---
name: bos-21st-ui
description: Use the 21st.dev MCP server to search and install ready-made React/shadcn UI components instead of hand-writing them. Use for UI components, buttons, forms, navbars, hero sections, pricing tables, dashboards, or any React/shadcn/Tailwind interface work.
---

# 21st.dev UI Components (via MCP)

A registered MCP server (`21st`) gives access to a large catalog of production
React + shadcn/ui + Tailwind components. Reach for it before writing common UI by hand.

## When to use it
- Any standard component (navbar, hero, pricing, form, card grid, dashboard shell,
  modal, table) — search the catalog first; installing a vetted component is faster
  and cleaner than writing from scratch.
- Building a marketing/site UI where polish matters.

## How
- Use the 21st MCP tools to **search** the catalog by description, then **install**
  the chosen component into the project.
- After install, adapt it to the project's design tokens (see `bos-frontend` /
  `web-design-guidelines`) — don't leave it generic.

## Limits (be honest with the user)
- Search is free; installing has a small free daily quota (~2 runs/day).
- AI generation is a PAID feature — do not trigger it without the user's ok.
- Requires the project stack to be React/Next + Tailwind; skip for other stacks.

## Rule
Prefer install-and-adapt over hand-rolling boilerplate UI, but always reshape the
component to match the project's look. Never ship the untouched default.
