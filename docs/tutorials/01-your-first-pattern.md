# Your first pattern

In about ten minutes you will add a small pattern called `nudge` to the collection, see it in the gallery and pass the gate. You need Node 20 or later and a clone of the repo.

## 1. Run the gallery

```bash
npm run dev
```

Open http://localhost:4321. Every card is a live demo. Stop the server with `Ctrl+C` when you want to rebuild.

## 2. Make the folder

```bash
mkdir patterns/nudge
```

Every entry has three files: `index.html` (the demo), `style.css` (the pattern itself) and `meta.json` (what it is and where it came from).

## 3. Write the pattern

`patterns/nudge/style.css`:

```css
/* nudge: a small sideways hint that something can be swiped. */
@keyframes nudge {
  0%, 100% { transform: none; }
  50%      { transform: translateX(8px); }
}
.nudge { animation: nudge var(--dur-slow) var(--ease-inout) 2 both; }

@media (prefers-reduced-motion: reduce) {
  .nudge { animation: none; }
}
```

It uses tokens from `tokens.css` and has a reduced-motion rule. The gate checks both.

## 4. Write the demo page

`patterns/nudge/index.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nudge · motion-patterns</title>
<link rel="stylesheet" href="../../tokens.css">
<link rel="stylesheet" href="../../demo.css">
<link rel="stylesheet" href="style.css">
<script src="../../play.js"></script>
</head>
<body>
<main class="stage">
  <p class="card nudge">Swipe for more</p>
</main>
</body>
</html>
```

## 5. Describe it

`patterns/nudge/meta.json`:

```json
{
  "name": "Nudge",
  "slug": "nudge",
  "kind": "pattern",
  "summary": "A small sideways hint, played twice, that a row can be swiped.",
  "category": "emphasis",
  "tech": ["css"],
  "tokens": ["--dur-slow", "--ease-inout"],
  "trigger": "load",
  "reduced_motion": "final-state",
  "relation": "original",
  "added": "2026-10-13"
}
```

## 6. Write its README

`patterns/nudge/README.md`:

```markdown
# Nudge

A small sideways hint, played twice, that a row can be swiped.

## Use

    <p class="nudge">Swipe for more</p>

## Reduced motion

The element stays still.
```

## 7. Pass the gate

```bash
npm run check
```

It fails with `the catalogue is out of date`. That is expected: the README table is generated.

```bash
npm run catalogue
npm run check
```

`check passed`. Run `npm run dev` again and the Nudge card is in the gallery.

## What you learned

- An entry is a folder with `index.html`, `style.css` and `meta.json`.
- The gate checks tokens, the reduced-motion rule, the metadata and the catalogue.
- Next: [add an entry from someone else's work](../how-to/credit-a-source.md), which is how most of this collection grows.
