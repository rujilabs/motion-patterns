# Add an entry

Add a pattern (one move) or a template (a finished scene built from patterns).

## Pattern

1. Create `patterns/<slug>/` with `index.html`, `style.css`, `meta.json`. Copy an existing pattern as the starting point; [`rise`](../../patterns/rise/) is the smallest.
2. Put **only the pattern** in `style.css`. Demo layout goes in an optional `page.css`, so people who copy `style.css` get nothing extra.
3. Use tokens from [`tokens.css`](../../tokens.css). Need a new curve? Add a token there first.
4. Add a `@media (prefers-reduced-motion: reduce)` rule that leaves the element in its finished state.
5. If the start state is hidden, scope it under `.js`, and trigger with `[data-play]` + `.go` (see [`draw`](../../patterns/draw/style.css)). Without `play.js` the content must still show.
6. Fill in `meta.json` ([fields](../reference/meta-json.md)).
7. Write `README.md`: one line on what it is, a live demo link, a Use snippet, a table of variants or options, Do, Do not, and what happens under reduced motion. Copy the shape from [`rise`](../../patterns/rise/README.md).
8. Run `npm run catalogue && npm run check`.

## Template

Same as a pattern, under `templates/<slug>/`, with two differences:

- Link the pattern stylesheets it uses (`../../patterns/<name>/style.css`) instead of copying them, and list them in `meta.json` `uses`.
- Templates do not load `demo.css`; they carry their own full-page style.

> [!WARNING]
> **Specificity traps that shipped and were caught in review:**
> - Pattern stylesheets must not set per-element delays with `:nth-child`. That beats the template's own delay classes. Put demo delays in `page.css`.
> - A rule that sets the `animation` shorthand resets `animation-delay`. If a sequencing rule (like `draw-seq`) must win over `.js .go .x`, repeat the same context in its selector.
> - The reduced-motion rule must list every selector that starts the animation (`.js .go .x`, `.js .x.go`, and so on), or the higher-specificity one keeps playing.
> - In a grid, `order` also changes paint order: an element moved first can end up painted under a positioned sibling. Give it `z-index`.

## Before you open the pull request

- [ ] `npm run check` passes
- [ ] The demo looks right with reduced motion on (DevTools > Rendering > Emulate CSS `prefers-reduced-motion`)
- [ ] The demo works at 375 px wide, and fits inside its gallery stage: 4:3 for patterns, while templates render at 1280 x 720 and scale down (a short frame: use a `max-height` query in `page.css` if it does not)
- [ ] The motion shows on the timeline under the stage: it uses CSS animations or the Web Animations API (the timeline reads `document.getAnimations()` in the demo), and an entrance finishes within about 3 seconds
- [ ] Anything that moves on its own for more than 5 seconds can be paused
- [ ] `relation` and `source` are honest ([credit a source](credit-a-source.md))
