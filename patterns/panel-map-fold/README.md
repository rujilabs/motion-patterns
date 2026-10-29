# Folding map

Use when: directions to an event or a shop should open like the printed map in an invitation, one fold at a time.

A drawn map folded into equal panels (a roll fold: every crease turns the same way, so each folded panel carries the rest of the stack on its back). It opens one crease at a time, left to right. Each panel turns about its real crease in perspective, and every panel is a window onto a copy of the same drawing, shifted by its own width, so the streets, the river and the route run on unbroken across each fold. Folded layers sit one paper thickness apart and never cut through each other. A panel darkens as its face turns away from a light on the upper left, its back darkens as it turns away in turn, and a shadow gathers in each crease while it bends, leaving a faint worn line when flat. The shadow on the table grows with the map. One damped spring moves the lot, so the last panel lands, swings a few degrees past flat and settles.

[Live demo](https://motion.rujilabs.com/patterns/panel-map-fold/) · [style.css](style.css) · [panel-map-fold.js](panel-map-fold.js)

## Use

```html
<link rel="stylesheet" href="panel-map-fold/style.css">
<script src="play.js"></script>
<script src="panel-map-fold/panel-map-fold.js" defer></script>

<div class="mapfold" data-panels="4" data-value="0"
     aria-label="Map from Exit 23 to Dewan Orkid" aria-describedby="steps">
  <svg viewBox="0 0 360 288" aria-hidden="true">...the whole map, drawn once...</svg>
</div>
<ol id="steps">...the directions in words...</ol>
```

Draw the map once, at the size it has fully open. The script builds the panels and copies the drawing into each one. The element becomes a `role="slider"`, whose children a screen reader does not read, so give the directions in text next to it and point at them with `aria-describedby`.

```js
map.addEventListener("foldchange", (e) => e.detail.value); // creases open, once it comes to rest
map.mapfold.set(3);                                         // open it all from code
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-panels` | How many panels. Creases are one fewer | `4` |
| `data-value` | Creases open at the start | `0`, folded |
| `--mapfold-paper-back` | The colour of the back of the paper | `#e7dfca` |
| `--mapfold-crease` | The worn line along each crease | Brown at 16 percent |
| `--mapfold-ring` | Focus ring | Map red `#c8372d` |

| Input | Does |
|---|---|
| Drag sideways | Pulls the free edge open, or pushes it shut. A flick carries on to the next crease |
| Tap | Opens the next crease, or folds it all once open |
| Arrow Right or Up, Left or Down | One crease more or less |
| Home, End | Fully folded, fully open |
| Enter, Space | Opens or folds the lot |

## Do

- Put what people need first on the first panel. In the demo, the folded map already shows the exit to take.
- Leave room for the open map. Folded it is one panel wide, open it is all of them.
- Label the panels' content in text too: street names in an SVG are not read out.

## Do not

- Split text that must stay readable across a crease when folded. It reads only once open.
- Use more than five or six panels on a phone. Each one gets too narrow to read.

## Reduced motion

It jumps to the next crease: no swing, no overshoot. The light and the crease lines show the state as usual.

## See also

[`page-curl`](../page-curl/), one page peeling back from its corner, and [`paper`](../paper/), layers that stand up on a fold.
