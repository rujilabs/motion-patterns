# 0004 Object categories next to behaviour categories

- Status: accepted
- Date: 2026-10-29

## Context

Until v0.3.0 every category named what the motion does: entry, scroll, state, transition and so on. People looking for "a gear", "a globe" or "a time wheel" think in objects, not behaviours, and the collection had no home for 3D objects that move by their own physics (gear trains, drums, hinged panels, spheres).

## Decision

Add eleven object categories beside the behaviour ones: `curve`, `morph`, `tile`, `solid`, `gear`, `panel`, `light`, `wave`, `globe`, `drum`, `form` (and five more entries in `data`). Every object-family entry:

- is built around one real job, named in a `Use when:` first line of its README, and no job is repeated anywhere in the collection;
- is `relation: original`, with zero dependencies (CSS 3D, SVG, Canvas 2D, small vanilla JS);
- gets the physics right (gear speed follows tooth ratio, drums snap, panels swing on a hinge, light falls off with distance);
- works by mouse, touch and keyboard when it is hands-on, and runs on a simulated clock when it depends on the time of day.

Existing entries keep their category; an entry has exactly one.

## Consequences

- The gallery filter has 22 categories in two rows, and the `motion.css` budget rose from 48 KB to 80 KB gzipped (64.9 KB at v0.4.0). Every `motion-<category>.css` still stays under 10 KB.
- Some entries could sit in either kind (a pay button morph is also a state change). The rule is: if the object is what you would search for, it goes in the object category.
- Globes embed their own copy of the land data (4 to 6 KB gzipped each) so every entry stays self-contained, at the cost of duplication.
- Spec and plan: `docs/superpowers/specs/2026-10-29-object-categories-design.md`, `docs/superpowers/plans/2026-10-29-object-categories.md`.
