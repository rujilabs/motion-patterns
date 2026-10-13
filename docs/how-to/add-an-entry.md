# Add an entry

Add a pattern (one move) or a template (a finished scene built from patterns).

## Pattern

1. Create `patterns/<slug>/` with `index.html`, `style.css`, `meta.json`. Copy an existing pattern as the starting point; [`rise`](../../patterns/rise/) is the smallest.
2. Put **only the pattern** in `style.css`. Demo layout goes in an optional `page.css`, so people who copy `style.css` get nothing extra.
3. Use tokens from [`tokens.css`](../../tokens.css). Need a new curve? Add a token there first.
4. Add a `@media (prefers-reduced-motion: reduce)` rule that leaves the element in its finished state.
5. If the start state is hidden, scope it under `.js`, and trigger with `[data-play]` + `.go` (see [`draw`](../../patterns/draw/style.css)). Without `play.js` the content must still show.
6. Fill in `meta.json` ([fields](../reference/meta-json.md)).
7. Run `npm run catalogue && npm run check`.

## Template

Same as a pattern, under `templates/<slug>/`, with two differences:

- Link the pattern stylesheets it uses (`../../patterns/<name>/style.css`) instead of copying them, and list them in `meta.json` `uses`.
- Templates do not load `demo.css`; they carry their own full-page style.

> [!WARNING]
> Pattern stylesheets must not set per-element delays with `:nth-child`. That beats the template's own delay classes on specificity. Put demo delays in `page.css`.

## Before you open the pull request

- [ ] `npm run check` passes
- [ ] The demo looks right with reduced motion on (DevTools > Rendering > Emulate CSS `prefers-reduced-motion`)
- [ ] The demo works at 375 px wide
- [ ] `relation` and `source` are honest ([credit a source](credit-a-source.md))
