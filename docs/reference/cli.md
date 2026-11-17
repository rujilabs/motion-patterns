# CLI

`npx motion-patterns` copies entries from [motion.rujilabs.com](https://motion.rujilabs.com) into a project. No
dependencies, Node 20 or later. Source in [`cli/`](../../cli/), decision in
[ADR 0007](../explanation/decisions/0007-cli-reads-the-live-catalogue.md).

## Commands

| Command | Does |
|---|---|
| `list [--category <c>] [--kind pattern\|template] [--tech <t>]` | Every entry, one line each: slug, category, summary |
| `search <words...>` | Entries whose slug, name, summary, category or tech contain every word; slug and name hits first |
| `categories` | Every category and how many entries it has |
| `info <slug>` | The entry's README, its live demo link and the files `add` would copy |
| `add <slug...>` | Copies the entries into `--dir` and prints the tags for `<head>` |

## Options

| Option | Default | Does |
|---|---|---|
| `--dir <path>` | `motion` | Where `add` copies to |
| `--force` | off | Overwrite files that already exist. Without it `add` keeps yours and says so |
| `--dry-run` | off | Show what `add` would write; write nothing |
| `--json` | off | `list` and `search` print JSON |
| `--site <url>` | `https://motion.rujilabs.com` | Read another copy of the site, e.g. `http://localhost:4321` from `npm run dev`. Also `MOTION_PATTERNS_SITE` |
| `-h`, `--help` | | Usage |
| `-v`, `--version` | | CLI version (same as the collection release it shipped with) |

## What `add` writes

```text
motion/
  tokens.css            always
  play.js               when an entry plays in view or on scroll
  fonts/                when an entry's CSS loads a font, with OFL.txt
  <slug>/style.css      one folder per entry
  <slug>/<slug>.js      and any script or SVG the entry needs
```

- A template brings the patterns it is built from (its `uses`), and they load before it.
- Font paths in CSS are rewritten from `../../fonts/` to `../fonts/`.
- Every file is downloaded before any is written: a failed download leaves the project as it was.
- An unknown slug stops the command before anything is written, and suggests close names.

## catalogue.json

Written by `npm run build` to `dist/catalogue.json`, served at `/catalogue.json`. The CLI reads nothing else to plan.

| Field | Meaning |
|---|---|
| `format` | Contract version. The CLI refuses a format it does not know and asks to be updated |
| `version`, `site` | The collection release and its address |
| `shared` | Paths of `tokens.css`, `play.js` and the `fonts` folder |
| `entries[].slug`, `kind`, `name`, `summary`, `category`, `tech`, `trigger`, `added` | From the entry's `meta.json` |
| `entries[].path` | The entry folder, e.g. `patterns/badge` |
| `entries[].files` | Files a page needs. Never the demo: `README.md`, `index.html`, `meta.json`, `page.css`, `demo.js`, `demo.css`, `poster.jpg`, `preview.mp4` |
| `entries[].fonts` | Font files its `style.css` loads |
| `entries[].uses` | For templates, the patterns it is built from |
| `entries[].play` | Needs `play.js`: the trigger is `in-view` or `scroll`, or its README's Use block loads it |

Renaming or removing a field is breaking: bump `format` and release a CLI that reads both.
