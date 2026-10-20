# Mega menu

A wide panel that drops from the nav bar. The first open unrolls it from its top edge while the columns rise in one after another. Moving to another section while it is open keeps the panel: it morphs to the new height, a marker slides under the new nav item, and the new columns come in from the side you moved toward.

[Live demo](https://motion.rujilabs.com/patterns/mega-menu/) · [style.css](style.css) · [mega.js](mega.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="mega-menu/style.css">
<script src="mega-menu/mega.js"></script>

<nav class="mega" aria-label="Main">
  <ul>
    <li><button type="button" aria-expanded="false" aria-controls="m-a">Furniture</button></li>
    <li><button type="button" aria-expanded="false" aria-controls="m-b">Lighting</button></li>
  </ul>
  <span class="mega-mark" aria-hidden="true"></span>
  <div class="mega-panel">
    <div class="mega-sections">
      <section class="mega-section" id="m-a" aria-label="Furniture">
        <div class="mega-col">...</div>
        <div class="mega-col">...</div>
      </section>
      <section class="mega-section" id="m-b" aria-label="Lighting">...</section>
    </div>
  </div>
</nav>
```

The panel hangs from the bottom of `.mega` and spans its width, so make `.mega` the whole bar. Paint the panel, the columns and the marker yourself.

## Parts

| Class or property | What it does |
|---|---|
| `.mega.is-open` | Set by the script. Unrolls the panel and shows the marker |
| `.mega-mark` | A 2px line under the open nav item. Takes `currentColor` |
| `--mega-h` | The open section's height, measured by the script. The panel animates to it |
| `--mega-dir` | `1` or `-1` when switching right or left, `0` on first open |
| `.mega-col` | Each column rises (first open) or slides in (switch), one `--stagger` apart, capped at 6 |

The script opens on click, closes on a second click, Esc (focus returns to the button) or a click outside, and keeps hidden sections `inert`.

## Do

- Open on click. A panel that opens on hover flickers open as the pointer crosses the bar on its way somewhere else.
- Keep sections short enough to read at a glance. Three or four columns, five links each.

## Do not

- Close and reopen the panel when the reader moves between sections. The morph is what tells them they are still in the same menu.
- Use it on a phone as is. Below a tablet width, turn the sections into an accordion inside a [hamburger](../hamburger/) menu.

## Reduced motion

The panel appears at its final height, the marker jumps, and the columns show at once.
