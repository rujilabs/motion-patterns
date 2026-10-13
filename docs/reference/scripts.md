# Scripts

All in [`scripts/`](../../scripts/), no dependencies.

| Command | Does |
|---|---|
| `npm run check` | The gate: entries, metadata, CSS rules, CSP rules, dashes, catalogue freshness |
| `npm run catalogue` | Rewrites the catalogue in `README.md` and `docs/reference/catalogue.md` |
| `npm run build` | Gate, then `dist/`: the gallery, one entry page per entry (stage, timeline, README, CSS) with the bare demo beside it as `demo.html`, the `motion.css` bundle (10 KB gzipped budget), curve plots generated from `tokens.css`, sitemap |
| `npm run dev` | Build, then serve `dist/` on port 4321 (`PORT` to change) |
| `npm run preview -- <dir> [s]` | Record a demo to `preview.mp4` (needs Playwright + ffmpeg, see [export a preview](../how-to/export-a-preview.md)) |
| `npm run changelog` | Regenerate `CHANGELOG.md` with git-cliff |
