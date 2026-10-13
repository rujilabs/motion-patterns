# Skeleton and handover

Loading placeholders drawn on the real layout. Each bone is the element that will hold the content, so when the data arrives nothing moves. One light passes over every bone at once, and on arrival each bone dissolves into its content, top to bottom.

[Live demo](https://motion.rujilabs.com/patterns/skeleton/) · [style.css](style.css) · [skeleton.js](skeleton.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="skeleton/style.css">
<script src="skeleton/skeleton.js"></script>

<article data-skeleton aria-busy="true">
  <img class="bone-block" src="map.png" alt="Route map">
  <h2><span class="bone">Arriving in 12 min</span></h2>
  <p class="bone-lines">Two or three lines of placeholder text of about the right length.</p>
</article>
```

When your data is in, fill the elements and set `aria-busy="false"`. To load again, set it back to `"true"`.

Render the bones with placeholder text of about the real length (or give them a width). The bone is that text's box, which is why the swap does not shift the layout.

## Parts

| Class or attribute | What it does | Use for |
|---|---|---|
| `[data-skeleton]` + `aria-busy` | The container. `true` shows bones, `false` runs the handover | A card, a row, a panel |
| `.bone` | One line of text. The bar is cap height, centred on the line, as wide as the text | Names, prices, headings |
| `.bone-lines` | A paragraph: one bar per line, cut from one sheet with a mask | Descriptions, addresses |
| `.bone-block` | The whole box, with its own `border-radius` | Images, avatars, maps |
| `--bone`, `--bone-sheen`, `--sheen-dur` | Bone colour, light colour, one pass of the light | Matching your palette |
| `skeleton.js` | Numbers the bones in reading order as `--bone-i` so the handover runs top to bottom | Optional: without it every bone hands over at once |

The light uses `background-attachment: fixed`, so all bones show slices of one gradient that crosses the screen. Each bar does not flash on its own.

## Do

- Show bones only when the wait is longer than about 300 ms. A shorter wait reads as a flash.
- Keep `aria-busy` on the container. Screen readers then wait for the content.

## Do not

- Draw bones for things that will not be there. A bone promises content in that exact place.
- Leave a skeleton running when the request failed. Replace it with the error and a way to retry.

## Reduced motion

The bones hold still with no light passing, and the content replaces them at once with no blur.

## Browser support

The cap-height bar uses the `cap` and `lh` units (Chrome 118, Safari 17.2, Firefox 120). Older browsers fall back to a bar of about the same height. Mobile Safari ignores `background-attachment: fixed`, so there each bone carries its own light.
