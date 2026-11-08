# Technique gaps from a public component library (2026-11-09)

## Why

A large public React component library covers techniques this collection does not have yet. Its licence
(MIT with a Commons Clause) forbids redistributing its components "as a ported version", so nothing from it
is ported, copied or credited as a source. Only the generic technique names (a dock, a scroll card stack, a
slide-to-pay control) were listed. Every entry below is built from scratch, without reading that source, and
ships as `relation: original`.

## Scope

About 65 entries over three releases:

| Release | Tier | Entries | Tech |
|---|---|---|---|
| v0.6.0 | A | 20 | CSS, SVG, small JS |
| v0.7.0 | B part 1 | about 22 | Canvas 2D and JS |
| v0.8.0 | B part 2 | about 23 | Canvas 2D and JS |

WebGL shader backgrounds (tier C) are out of scope.

## Rules for every entry

- One real job per entry, never a job already in the catalogue. Fictional Malaysian businesses, specific numbers.
- `style.css` holds only the pattern and stays lean: `motion.css` was at 66.4 of 80 KB gzipped before this work,
  `motion-state.css` at 9.3 of 10 KB. Hands-on controls go in `form`, not `state`.
- Reduced motion, keyboard, touch and the 390 px rules from `docs/how-to/add-an-entry.md`.

## Tier A (v0.6.0)

| Slug | Category | Job |
|---|---|---|
| dock-magnify | emphasis | staff portal app bar: icons grow near the pointer |
| scroll-card-stack | scroll | pricing plans pile up on each other as the page scrolls |
| blur-in-text | type | studio hero line: words sharpen out of a blur one by one |
| scroll-word-reveal | scroll | founder letter: words light up as you read down |
| scroll-speed-marquee | scroll | a marquee that runs faster when the reader scrolls faster |
| focus-word | type | tagline: a focus frame steps word to word, the rest blurred |
| border-orbit | light | featured plan card: a light runs round its border |
| target-brackets | emphasis | four corner brackets snap onto the hovered product |
| image-trail | emphasis | photographer hero: photos drop behind the moving pointer |
| flowing-menu-row | state | menu row floods with a running marquee on hover |
| hold-to-confirm | form | delete a saved card: hold for 1.5 s, ring fills |
| slide-to-pay | form | slide the knob to pay RM 86.40 |
| otp-slots | form | 6-digit TAC input with a caret that moves between slots |
| edge-blur | look | progressive blur where a scrolling list meets the header |
| sticker-peel | emphasis | promo sticker peels back to show the code |
| tear-ticket | panel | tear the stub off a ferry ticket to check in |
| swipe-row-actions | form | swipe an inbox row to reveal Archive and Delete |
| heart-burst | emphasis | save a recipe: heart pops with a ring of dots |
| folder-open | panel | a folder opens and fans out three documents |
| masonry-settle | entry | bakery gallery tiles drop into a masonry grid |
