# Albert Huynh — portfolio

A single-page portfolio built with Create React App. No UI framework, no
animation library: the motion is a small spring engine in `src/lib/`.

## Running it

```bash
npm install
npm start      # http://localhost:3000
npm run build  # production bundle in build/
```

## Structure

```
public/img/            images the page ships (920KB total)
design/originals/      the full-resolution hero_img.png and about-me.png the
                       optimised versions were made from; not deployed
src/lib/spring.js      spring solver, momentum projection, rubber-banding,
                       velocity tracking
src/lib/motion.js      reveal-on-scroll, spring page scroll, scroll spy
src/lib/theme.js       light / dark / follow-the-system preference
src/sections/          one file per section of the page
src/data/index.json    all copy for the expertise and experience cards
```

## Editing content

Everything on the page that is a list lives in `src/data/index.json`:

- `skills` — the four expertise cards. `src` points at a **solid black PNG
  glyph**; it is used as a CSS mask, so the icon takes the accent colour and
  adapts to dark mode automatically. Swap in any black-on-transparent icon.
- `portfolio` — the work shelf. `role` and `period` are optional; leave them
  as `""` and the line is omitted. Clio's is currently blank.
- `testimonial` — kept for later; no section renders it yet.

Prose that isn't a list (hero, about, contact) lives directly in the matching
file in `src/sections/`.

## How the motion works

Every animation is a spring described by a **damping ratio** (how much it
overshoots) and a **response** (how quickly it gets there), rather than a
duration and an easing curve. Springs are used because they are interruptible:
re-targeting one keeps its current value *and* velocity, so a gesture can grab
a moving element and reverse it without a jump.

The work shelf is the fullest example — drag it and it tracks your pointer 1:1,
resists past the ends, and on release projects where the flick was heading
before snapping there with your release velocity carried into the spring.

`prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`
are all honoured; with reduced motion the springs become instant state changes
and reveals become cross-fades.
