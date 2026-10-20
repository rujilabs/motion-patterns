# Text on a path

Text set along a curved SVG path that travels along it in an endless, seamless loop, like a ribbon banner or a ticker that follows a line in the drawing.

[Live demo](https://motion.rujilabs.com/patterns/text-on-path/) · [style.css](style.css) · [on-path.js](on-path.js)

## Use

```html
<link rel="stylesheet" href="text-on-path/style.css">
<script src="text-on-path/on-path.js"></script>

<section class="path-group">
  <label class="path-pause"><input type="checkbox"> Pause</label>
  <svg viewBox="0 0 600 230" role="img" aria-label="Fresh bread, coffee, plants">
    <path id="curve" fill="none" d="M 0 124 C 110 30, 220 30, 300 104 S 480 180, 600 70" />
    <text aria-hidden="true"><textPath class="path-travel" href="#curve">Fresh bread · Coffee · Plants · </textPath></text>
  </svg>
</section>
```

Write the phrase once, ending with its own separator. The script repeats it until it covers the path.

## Options

| Class or property | What it does |
|---|---|
| `.path-travel` on a `<textPath>` | The text travels toward the start of the path |
| `.path-travel-reverse` | Add to the same element: the text travels toward the end of the path |
| `--tp-dur` | Time for the text to move by one phrase, default `9s` |
| `.path-pause` inside `.path-group` | A checkbox that pauses the text |

SVG has no CSS property for where text starts on a path, so `style.css` animates a registered custom property (`--tp-shift`) and the script copies it into the `startOffset` attribute every frame. Because the motion is a real CSS animation, the pause toggle, the browser's animation tools and reduced motion all work on it. One cycle moves the text by exactly one phrase, measured with the real font after it loads, so the loop never jumps.

## Do

- Keep it to a short, repeating list: what a market sells, the names on a programme, a slogan.
- Draw the path, or something that rhymes with it, so the curve reads as part of the picture.
- Put the whole text in the `<svg>`'s `aria-label`, once, and hide the repeated copies.

## Do not

- Run text along a tight curve: letters fan apart on the outside of a bend and crowd on the inside.
- Put anything someone must read in full. It never stops in one place.

## Reduced motion

The text stays where it starts on the path, and the pause toggle hides. Browsers without registered custom properties also show it still.
