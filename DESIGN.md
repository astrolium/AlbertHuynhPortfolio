---
version: 1
name: albert-huynh-portfolio
description: Warm editorial portfolio. Cream canvas, a serif for display type, one coral accent, flat surfaces. Adapted from the Claude DESIGN.md in VoltAgent/awesome-design-md and audited against Leonxlnx/taste-skill (vendored at .claude/skills/design-taste-frontend).

colors:
  canvas: "#faf9f5"        # --bg
  canvas-tint: "#f5f0e8"   # --bg-tint, Work band and footer
  surface: "#fdfcfa"       # --surface, figure frames
  surface-2: "#efe9de"     # --surface-2, tags, figure caption bar
  ink: "#141413"           # --text
  body: "#3d3d3a"          # --text-2
  muted: "#6c6a64"         # --text-3 (5.1:1 on canvas)
  hairline: "#e6dfd8"
  accent: "#a9583e"        # buttons + small text; white on it is 5.1:1
  tone: "#cc785c"          # figures and large type only; white on it fails AA
  dark:
    canvas: "#181715"
    canvas-tint: "#1f1e1b"
    surface: "#252320"
    ink: "#faf9f5"
    body: "#c2bfb6"
    muted: "#a09d96"
    accent: "#e08a6b"      # ink text on it, not white

typography:
  display: "Cormorant Garamond 500 (italic for emphasis), self-hosted via @fontsource"
  sans: "Geist Variable, self-hosted via @fontsource-variable"
  rules:
    - Display sizes are weight 500, never bold. Hierarchy comes from size.
    - Emphasis inside a headline is italic in the same face, never a second font.
    - Hero headline holds to 2 lines at desktop.

rounded:
  control: 8px   # buttons, nav pills, menu items
  card: 12px     # menu sheet
  frame: 16px    # work figure frames
  full: 9999px   # tags, icon buttons

icons: "@phosphor-icons/react only, no hand-drawn icon paths"
---

## Rules that are easy to break

- **One accent.** Every chapter uses the coral; per-company brand colours were
  removed on purpose.
- **Zero em or en dashes** in anything a visitor can read, including aria-labels
  and alt text. Use a comma, colon or period.
- **At most one eyebrow per three sections.** Right now only the hero and Contact
  have one.
- **One label per intent.** Contact is "Email me" everywhere.
- **No scroll listeners.** Work figure progress (`--p`, `--p1`…`--p6`) runs on a
  CSS view timeline in App.css. The nav uses IntersectionObserver. Browsers
  without scroll timelines get the finished figure.
- **Work chapters never run three side-by-side splits in a row.** Tecsys is
  `layout: "stack"` in `src/data/index.json` to break the zigzag.
- **No pure black or white**, and no cool greys: every neutral is warm-tinted.
