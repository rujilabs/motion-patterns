# Breadcrumbs

A trail that grows as you go deeper and folds back when you climb up. A new crumb first opens its own width, so the trail makes room without a jump, and its label slides in a beat later. Picking an earlier crumb folds the ones after it, the last one first.

[Live demo](https://motion.rujilabs.com/patterns/breadcrumbs/) · [style.css](style.css) · [breadcrumbs.js](breadcrumbs.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="breadcrumbs/style.css">
<script src="breadcrumbs/breadcrumbs.js"></script>

<nav aria-label="Breadcrumb">
  <ol class="crumbs">
    <li class="crumb"><span><a href="/drive" aria-current="page">Shared</a></span></li>
  </ol>
</nav>
```

```js
const li = document.createElement("li");
li.innerHTML = '<span><a href="/drive/projects">Projects</a></span>';
breadcrumbs.push(list, li);   // goes one level deeper
breadcrumbs.trim(list, 1);    // keeps the first crumb, folds the rest
```

Each `.crumb` holds one child that carries the separator and the link. That child is what gets clipped while the crumb opens or folds.

## Parts

| Class or call | What it does |
|---|---|
| `.crumb` | A one-column grid. Its column animates between `0fr` and `1fr`, which is how a width of auto can open and fold |
| `.crumb-in` | Added by `push`. Opens the column, then slides the label in from 12px right |
| `.crumb-out` | Added by `trim`. Folds the column; `--crumb-o` staggers the crumbs so the last one goes first |
| `breadcrumbs.push(list, li)` | Appends, animates, moves `aria-current="page"` to it, and scrolls a scrolling trail to its end |
| `breadcrumbs.trim(list, n)` | Keeps `n` crumbs, folds the rest, removes them from the page when they finish |

## Do

- Let a long trail scroll sideways (`overflow-x: auto` on `.crumbs`) and keep the newest crumb in view. The script scrolls to the end on every push.
- Keep the slide short. The crumb is small; 12px is enough to show direction.

## Do not

- Animate the trail on a full page load. It belongs to moves inside one view, such as a file browser or a settings panel.
- Fold a crumb the reader is about to click. `trim` makes folding crumbs `inert` so a fast second click does not land on one.

## Reduced motion

Crumbs appear and disappear at once. The trail still scrolls to its end.
