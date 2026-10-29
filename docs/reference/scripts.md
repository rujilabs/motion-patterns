# Scripts

All in [`scripts/`](../../scripts/), no dependencies.

| Command | Does |
|---|---|
| `npm run check` | The gate: entries, metadata, CSS rules, CSP rules, dashes, catalogue freshness |
| `npm run catalogue` | Rewrites the catalogue in `README.md` and `docs/reference/catalogue.md` |
| `npm run build` | Gate, then `dist/`: the gallery, one entry page per entry (stage, timeline, README, CSS) with the bare demo beside it as `demo.html`, the `motion.css` bundle of every pattern (80 KB gzipped budget) and one `motion-<category>.css` per category (10 KB gzipped budget each), curve plots generated from `tokens.css`, sitemap |
| `npm run dev` | Build, then serve `dist/` on port 4321 (`PORT` to change) |
| `npm run posters [-- <slug>]` | Capture each template's finished frame to `poster.jpg` (needs Playwright). The gallery shows it until a visitor stops on the template; the gate fails a template without one |
| `npm run preview -- <dir> [s]` | Record a demo to `preview.mp4` (needs Playwright + ffmpeg, see [export a preview](../how-to/export-a-preview.md)) |
| `npm run changelog` | Regenerate `CHANGELOG.md` with git-cliff |
