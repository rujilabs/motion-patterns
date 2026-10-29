# Crate stack

Use when: a stock or warehouse screen books in a delivery, and the count should feel like real goods arriving.

Crates drop onto a pallet and stack, three across, two deep, layer on layer. Each crate is a box of five faces in CSS 3D. It falls under gravity, so it speeds up all the way down, a few degrees askew, so its low corner meets the surface first. It bounces once at a fifth of the speed it hit with, then the tilt and twist die away and it sits square. Faces are shaded from one fixed light, recomputed while the crate tilts, and its contact shadow on the pallet or on the crate below grows darker and sharper as the gap closes. The count goes up as each crate lands, not before.

[Live demo](https://motion.rujilabs.com/patterns/solid-crate-stack/) · [style.css](style.css) · [crate-stack.js](crate-stack.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="solid-crate-stack/style.css">
<script src="play.js"></script>
<script src="solid-crate-stack/crate-stack.js" defer></script>

<div class="crate-bay" role="img" aria-label="Pallet with 9 crates">
  <div class="crate-world">
    <!-- one span per slot, in stacking order -->
    <span class="crate" data-drop>
      <span class="crate-face crate-back"></span><span class="crate-face crate-left"></span>
      <span class="crate-face crate-right"></span><span class="crate-face crate-front">RICE 5 × 10 KG</span>
      <span class="crate-face crate-top"></span>
    </span>
    <span class="crate" hidden>...</span>
  </div>
</div>
```

Crates with `data-drop` fall when the bay scrolls into view. Crates with `hidden` wait off the pallet until you book them in:

```js
bay.crates.add(6);   // the next 6 hidden crates drop, 140 ms apart
bay.addEventListener("cratelanded", e => count.textContent = e.detail.count);
```

Crates are spans, so other elements in `.crate-world` (a floor, a pallet) do not shift the slot count.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `--cw`, `--ch`, `--cd` | Crate width, height and depth | `70px`, `50px`, `58px` |
| `--crate-wood`, `--crate-slat` | Board and gap colours | Pine |
| `--crate-shadow` | Shadow colour as `r g b` | `25 15 5` |
| `bay.crates.add(n)` | Drops the next `n` hidden crates; returns how many | |
| `bay.crates.free()` | Empty slots left | |
| `cratelanded` event | Fires as each crate hits, `detail.count` | |

## Do

- Drop no more than about 10 at a time. Past that the last one lands long after the booking.
- Count on landing. A number that jumps before the goods arrive breaks the illusion.

## Do not

- Use it for a single unit. One crate falling is a toast, not a stock count.
- Change the camera so the bottom face shows. There is none: crates sit on things.

## Reduced motion

Every crate is in its slot from the start and the count is final. Nothing falls.
