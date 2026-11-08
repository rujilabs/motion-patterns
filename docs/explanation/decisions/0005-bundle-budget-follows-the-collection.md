# 0005 The whole-collection budget follows the collection

- Status: accepted
- Date: 2026-11-09

## Context

`motion.css` holds every pattern in one file. ADR 0004 set its budget at 80 KB gzipped. v0.6.0 to v0.9.0 add 64
original entries, each a lean `style.css` of 0.4 to 1 KB gzipped, which takes the file past 80 KB.

The budget exists so nobody ships a heavy pattern by accident. The drop-in promise was never the whole file: it is
one entry's `style.css`, or one kind in `motion-<category>.css`, and those stay small.

## Decision

- `motion.css` budget: 80 KB to 112 KB gzipped, room for about 70 more entries at today's average.
- `motion-<category>.css` keeps its 10 KB cap. A category near it (`emphasis`, `state`) takes no new entries until
  it is split.
- Each entry's `style.css` should stay under 1 KB gzipped; demo layout goes in `page.css`.

## Consequences

- The README and gallery keep pointing people to one entry or one category file first, `motion.css` last.
- The next raise needs its own decision, and should come with a split of the biggest categories, not just a bigger number.
