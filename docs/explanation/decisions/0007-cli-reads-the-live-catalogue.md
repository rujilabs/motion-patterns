# 0007 A CLI that reads the live catalogue

- Status: accepted
- Date: 2026-11-17

## Context

Using one entry meant opening its folder, copying `tokens.css`, its `style.css`, any script it needs, `play.js` when
it plays in view, and the fonts its CSS points at, then fixing the font paths. With 315 entries that is easy to get
half right. The collection is copy-the-code on purpose (ADR 0001): no package to import, nothing to keep updated.

## Decision

Ship a small command line tool, `npx motion-patterns`, that does the copying and nothing else:

- It lives in `cli/` as its own npm package. The repo itself stays `private`; the CLI is the only thing published.
- It has no dependencies and needs Node 20 or later.
- It does not bundle the entries. It reads `catalogue.json` from the live site (written by `npm run build`) and
  downloads the files from there, so it always offers what the gallery shows and never needs a republish for a new
  entry. `--site` (or `MOTION_PATTERNS_SITE`) points it at another copy, such as `npm run dev`.
- `catalogue.json` lists, per entry, only the files a page needs (never the demo: `index.html`, `page.css`,
  `demo.js`, `poster.jpg`), the fonts its CSS loads, the patterns a template is built from, and whether it needs
  `play.js`. It carries a `format` number; a CLI that meets a newer format stops and asks to be updated.
- `add` copies into one folder (default `motion/`): `tokens.css`, `play.js` when needed, `fonts/` when needed, and one
  folder per entry. It never overwrites a file without `--force`, downloads everything before writing anything, and
  prints the tags to paste into `<head>`.

## Consequences

- Trying an entry is one command, and the copy is plain files the project owns, as before.
- The CLI needs the network, and it gets whatever is live: an entry changed on `main` changes what the next `add`
  copies. A project that wants to stay put keeps its copy, which `add` never overwrites unasked.
- `catalogue.json` is now a public contract. Renaming or removing a field is breaking and needs a `format` bump and a
  CLI release that reads both.
- Publishing to npm is a manual step in the release (see the release how-to). `cli/package.json` carries the same
  version as the collection, so `motion-patterns --version` names the release it came with.
