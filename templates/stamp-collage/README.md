# Stamp collage

A menu board where paper scraps stamp onto the page one after another, a price sticker pops onto each, and a "Sold out" seal lands on the weekend item. A live dot beats beside the opening hours and two shapes drift behind the cards.

[Live demo](https://motion.rujilabs.com/templates/stamp-collage/) · [index.html](index.html) · [style.css](style.css)

Built from [stamp](../../patterns/stamp/), [pop](../../patterns/pop/), [pulse](../../patterns/pulse/) and [drift](../../patterns/drift/). Copy CSS in the gallery gives one file with tokens, every pattern and this template.

## Timing

| Time | What moves |
|---|---|
| 0, 240, 480, 720ms | The four scraps stamp on (fall, squash, settle at a tilt) |
| 600ms after each scrap starts | Its price sticker pops on |
| About 1.7s | The "Sold out" seal lands on the third scrap |
| Always | The "open now" dot beats; the shapes drift |

Hover a card and it lifts 4px on a spring.

## Make it yours

- **Items:** each `li.scrap` takes a colour class (`scrap-warm`, `scrap-mint`, `scrap-blue`), a tilt (`tilt-l`, `tilt-r`, `tilt-s`) and a delay class (`s1` to `s4`, prices `p1` to `p4`).
- **Seal:** move `<span class="sold stamp-ink" role="status">` to any item; `role="status"` makes screen readers announce it.
- **Prices:** the visible number keeps a hidden "Price" label for screen readers; add your currency to both.

## Reduced motion

Every card, price and seal shows in place at its final tilt, the dot shows a still halo, and hover does not move the cards.
