# FAQ on a top hinge

Use when: a help page has questions whose answers should open in place, one at a time or several.

Each answer is a flap hung from the bottom edge of its question. Closed, the flap is lifted flat toward you. Opening, it drops on a top hinge, swings a little past hanging and settles, like a card flap with some weight. While it turns, the answer is exactly as tall as the flap looks (its height times the cosine of the angle), so the questions below move with the flap instead of jumping ahead of it. The light follows the same angle: tipped toward you the flap faces the ceiling and brightens, with a dark crease where it meets the question; swung back past hanging it faces the floor and goes dim. The chevron turns with it.

It is a real disclosure: a `button` with `aria-expanded` and `aria-controls`, and a `role="region"` labelled by the button, hidden once it is shut.

[Live demo](https://motion.rujilabs.com/patterns/panel-faq-hinge/) · [style.css](style.css) · [panel-faq-hinge.js](panel-faq-hinge.js)

## Use

```html
<link rel="stylesheet" href="panel-faq-hinge/style.css">
<script src="play.js"></script>
<script src="panel-faq-hinge/panel-faq-hinge.js" defer></script>

<div class="hinge-list" data-single>
  <div class="hinge" data-closed>
    <h3 class="hinge-h">
      <button class="hinge-q" id="q2" aria-expanded="true" aria-controls="a2">
        How much luggage can I bring on board?<span class="hinge-mark" aria-hidden="true"></span>
      </button>
    </h3>
    <div class="hinge-a" id="a2" role="region" aria-labelledby="q2">
      <div class="hinge-flap"><p>One bag up to 20 kg goes free.</p></div>
    </div>
  </div>
  <!-- one .hinge per question -->
</div>
```

Write every button as `aria-expanded="true"` and mark the ones that start shut with `data-closed`. Without the script every answer shows, so the page still reads.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-single` on `.hinge-list` | Opening one answer closes the others | Off: several can be open |
| `data-closed` on `.hinge` | Starts that answer shut | Open |
| `--hinge-paper` on `.hinge` | Flap colour | `#f3f6f7` |
| `--hinge-rule` | The rule down the flap's left edge | Sea teal `#0f7c8c` |
| `--hinge-ring` | Focus ring | Sea teal |
| `.hinge-mark` | The chevron. Leave it out for none | |

| Input | Does |
|---|---|
| Click, tap, Enter, Space | Opens or closes that answer |
| Arrow Up or Down | The previous or next question |
| Home, End | The first or last question |

Each `.hinge` fires `hingeopen` or `hingeclose` (they bubble), and `item.hinge.set(true)` opens one from code.

## Do

- Keep each answer short enough to read without scrolling. The swing is the size of the flap.
- Put the useful number first in the answer ("RM 5.00 at the counter"), as people scan.
- Let the region's height be set by the script. Padding inside `.hinge-flap` is fine; a margin on it is counted too.

## Do not

- Put links or form fields inside an answer that starts shut and expect them in the tab order. The region is `hidden` until it opens, as it should be.
- Use it for long legal text. A flap the height of the screen swings out over the whole page.

## Reduced motion

The answer opens and shuts at once: no swing, no lift, and the flap stays flat and evenly lit.

## See also

[`disclose`](../disclose/), the flat accordion on `details` and `summary`.
