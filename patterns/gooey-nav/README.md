# Gooey nav

Use when: a playful site (a swim school, a juice bar, a kids' class) has three to five tabs, and the marker under the chosen tab should feel like water moving from one tab to the next.

The blob stretches its leading edge to the new tab first, two drops pinch off the old tab and run after it, and an SVG goo filter (a blur, then a hard cut on the alpha) melts them into one shape. The tab labels sit above the filter, so the text stays sharp.

[Live demo](https://motion.rujilabs.com/patterns/gooey-nav/) · [style.css](style.css) · [gooey-nav.js](gooey-nav.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="gooey-nav/style.css">
<script src="gooey-nav/gooey-nav.js" defer></script>

<!-- once per page -->
<svg width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <filter id="gn-goo" x="-20%" y="-50%" width="140%" height="200%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
    <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/>
  </filter>
</defs></svg>

<div class="gn-list" aria-label="Classes by age">
  <span class="gn-goo" aria-hidden="true"><i class="gn-blob"></i><i class="gn-drop"></i><i class="gn-drop"></i></span>
  <button class="gn-tab" type="button" id="t1" aria-controls="p1" aria-selected="true">Kids</button>
  <button class="gn-tab" type="button" id="t2" aria-controls="p2" aria-selected="false">Adults</button>
</div>
<section class="gn-panel" id="p1" role="tabpanel" aria-labelledby="t1" tabindex="0">...</section>
<section class="gn-panel" id="p2" role="tabpanel" aria-labelledby="t2" tabindex="0" hidden>...</section>
```

The script adds the tablist roles and the keys: Left and Right move to the next tab and show it, Home and End jump to the ends. If your panels set `display`, add `[hidden] { display: none; }` for them.

## Options

| Name | What it does | Default |
|---|---|---|
| `--gn-blob` | Colour of the blob | `#1769aa` |
| `--gn-on` | Label colour on the blob | `#fff` |
| `stdDeviation` in the filter | How far apart shapes still join; raise it with taller tabs | `6` |
| Number of `.gn-drop` | Drops that run after the blob (0 to 3) | `2` |

## Do

- Keep the tabs on one row on a solid background: the goo filter only joins shapes inside `.gn-goo`.
- Use one solid colour for the blob. Gradients and shadows on it come out lumpy through the filter.

## Do not

- Do not use it for a calm, serious product (banking, health records): the liquid reads as play.
- Do not wrap the tabs onto two rows: the blob travels in a straight line.

## Reduced motion

The blob jumps to the chosen tab, no drops run and the panel shows without the fade.
