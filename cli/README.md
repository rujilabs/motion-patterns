# motion-patterns

Copy web motion into your project from the terminal. Small CSS patterns and full scenes from
[motion.rujilabs.com](https://motion.rujilabs.com), each with a reduced-motion state, no framework and no build step.

```bash
npx motion-patterns search drum
npx motion-patterns add rise badge
```

`add` copies plain files you own into `./motion/` and prints the tags for `<head>`:

```html
<link rel="stylesheet" href="motion/tokens.css">
<link rel="stylesheet" href="motion/rise/style.css">
<link rel="stylesheet" href="motion/badge/style.css">
<script src="motion/badge/badge.js"></script>
```

## Commands

| Command | Does |
|---|---|
| `list [--category <c>] [--kind pattern\|template] [--tech <t>]` | Every entry, one line each |
| `search <words...>` | Entries matching every word |
| `categories` | Categories and their counts |
| `info <slug>` | The entry's README, demo link and files |
| `add <slug...> [--dir motion] [--force] [--dry-run]` | Copy entries into your project |

`add` never overwrites a file without `--force`, downloads everything before it writes anything, and brings along
what an entry needs: `play.js` for in-view motion, fonts, and the patterns a template is built from.

The CLI reads the live catalogue, so new entries show up without updating it. No dependencies, Node 20 or later.

Full reference: [docs/reference/cli.md](https://github.com/rujilabs/motion-patterns/blob/main/docs/reference/cli.md).
Licence: MIT.
