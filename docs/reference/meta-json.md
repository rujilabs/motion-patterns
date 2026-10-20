# meta.json

Every entry folder has one. [`scripts/check.mjs`](../../scripts/check.mjs) validates it on every build.

| Field | Required | Values |
|---|---|---|
| `name` | yes | Display name |
| `slug` | yes | Equal to the folder name |
| `kind` | yes | `pattern` (in `patterns/`) or `template` (in `templates/`) |
| `summary` | yes | One or two sentences, at most 200 characters |
| `category` | yes | `entry`, `emphasis`, `loop`, `scroll`, `data` (charts and numbers), `state` (loading, opening, sorting, UI controls), `scene`, `type`, `transition` (one view replacing another), `camera` (film camera moves and shot styles, done in CSS), `look` (photo lighting, lens and tone looks) |
| `tech` | yes | Non-empty list from `css`, `svg`, `js`, `canvas`, `webgl`, `variable-font` |
| `tokens` | yes | Token names used, each defined in `tokens.css` (may be empty) |
| `trigger` | yes | `load`, `in-view`, `hover`, `click`, `scroll`, `loop` |
| `reduced_motion` | yes | `final-state` (shows the end) or `static` (never moves) |
| `relation` | yes | `original`, `port`, `recreation`, `inspired-by` |
| `source` | unless `original` | Object, below. Not allowed on `original` |
| `uses` | templates | Pattern slugs the template links |
| `added` | yes | `YYYY-MM-DD` |

## `source`

| Field | Required | Values |
|---|---|---|
| `title` | yes | Title of the post, pen or page |
| `author` | yes | Handle or name as shown at the source |
| `url` | yes | `https://` link to the original |
| `licence` | yes | SPDX id, or `none stated`. A `port` needs one of `MIT`, `CC0-1.0`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`, `Unlicense` |
| `notes` | no | Anything a reader should know about how it was made |

## Other checks on an entry

- `index.html`, `style.css`, `meta.json` and `README.md` exist.
- `style.css` has a `prefers-reduced-motion` rule.
- No HTML file has a `style=""` attribute, an inline `<style>` or `<script>`, an inline event handler or an external `src`/`href`.
- No text file has an en or em dash.
