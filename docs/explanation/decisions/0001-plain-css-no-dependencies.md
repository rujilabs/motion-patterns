# 0001 Plain CSS, no dependencies

- Status: accepted
- Date: 2026-10-13

## Context

Motion libraries usually ship as a JavaScript package (GSAP, Motion, anime.js) or a large CSS file. People who want one animation end up adopting a build tool, a runtime or a class vocabulary.

## Decision

Every pattern is plain CSS on shared tokens. JavaScript is limited to `play.js`, under 1 KB, which only adds a class when an element enters the viewport. The repo has no `dependencies` and no `devDependencies`; its scripts use Node built-ins only.

## Consequences

- Any entry can be copied as two files into any stack.
- Contributors need only Node to run the gate and the gallery.
- Motions that truly need a timeline engine (complex sequencing, physics, scroll scrubbing in older browsers) do not fit. A future `js` entry may use a library loaded by the entry itself, but it cannot become a dependency of the collection.
- Preview recording needs Playwright and ffmpeg, installed by hand for that one task.
