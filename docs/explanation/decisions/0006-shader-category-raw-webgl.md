# 0006 A shader category with raw WebGL

- Status: accepted
- Date: 2026-11-09

## Context

Some surfaces cannot be drawn well with CSS, SVG or Canvas 2D at 60 fps: flowing ink, molten metal, light through
a prism, a warp tunnel. They are per-pixel effects, and the GPU does them cheaply in a fragment shader. Until now
`webgl` was an allowed `tech` value with no entry using it, and no category to find such entries under.

## Decision

Add a `shader` object category for GPU fragment-shader backgrounds and surfaces. Every `shader` entry:

- uses raw WebGL 1 in a small vanilla script: no three.js, no libraries, no build step, no external files, and its
  shader source lives as strings in its own `<slug>.js` (each entry stays self-contained, at the cost of a repeated
  40 line runner);
- has one real job named in a `Use when:` first line of its README, like every object category;
- shows a meaningful still look when WebGL is missing, script is off or `prefers-reduced-motion: reduce` is set: a
  CSS gradient or image fallback in `style.css`, or one rendered frame, never a blank box;
- caps the drawing buffer at `devicePixelRatio` 1.5 (and lower on a slow first frame), stops drawing off screen or
  in a hidden tab, releases its context on `pagehide`, recovers from `webglcontextlost`, and has a Pause control;
- keeps the canvas decorative (`aria-hidden="true"`) with the real content in HTML.

## Consequences

- 23 categories. The `style.css` of a shader entry holds only the fallback and the canvas sizing, so
  `motion-shader.css` stays small; the weight is in the JS, which is not in the CSS bundle.
- A gallery page can hold many live WebGL contexts only if each one is torn down when it leaves the screen;
  browsers cap live contexts at about 16. The gallery's poster grid already starts one preview at a time.
- Spec: `docs/superpowers/specs/2026-11-09-react-bits-gaps.md`, "Tier C".
