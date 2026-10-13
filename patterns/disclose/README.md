# Accordion and tabs

Two ways to show one part of a page at a time. The accordion is native `<details>` that opens to its real height while the plus folds into a minus. The tabs have an inchworm ink: its leading edge moves to the new tab first and the trailing edge follows a beat later, so it stretches toward where you clicked and then gathers itself.

[Live demo](https://motion.rujilabs.com/patterns/disclose/) · [style.css](style.css) · [tabs.js](tabs.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="disclose/style.css">

<details class="disclose" name="faq">
  <summary>Can I return it? <span class="disclose-mark" aria-hidden="true"></span></summary>
  <p>Within 14 days, unworn with the tag on.</p>
</details>
```

```html
<script src="disclose/tabs.js"></script>

<section data-tabs>
  <div class="tabs-list" role="tablist" aria-label="About this shirt">
    <button type="button" role="tab" id="t-a" aria-controls="p-a" aria-selected="true">Details</button>
    <button type="button" role="tab" id="t-b" aria-controls="p-b" aria-selected="false">Sizing</button>
    <span class="tabs-ink" aria-hidden="true"></span>
  </div>
  <div class="tabs-panels">
    <div role="tabpanel" id="p-a" aria-labelledby="t-a" tabindex="0">...</div>
    <div role="tabpanel" id="p-b" aria-labelledby="t-b" tabindex="0">...</div>
  </div>
</section>
```

Style `.tabs-ink` yourself (an underline, a pill behind the label); the pattern only moves it.

## Parts

| Class or attribute | What it does |
|---|---|
| `.disclose` on `<details>` | Height from 0 to auto, the answer rises in after the box opens |
| `name="..."` on several `<details>` | Native: only one of them is open at a time |
| `.disclose-mark` | A plus that folds into a minus on the spring curve |
| `[data-tabs]` + `tabs.js` | ARIA tabs: click, arrow keys, Home and End |
| `.tabs-ink` | The inchworm: leading edge first, trailing edge `--ink-lag` (100ms) later |
| `.tabs-panels` | Panels share one grid cell, so the box keeps the height of the tallest panel and never jumps. The new panel slides in from the side the ink moved toward |

## Do

- Put the whole answer in the accordion panel. In Chromium browsers, find in page (Ctrl+F) opens a closed `<details>` that contains a match.
- Keep tab labels to one or two words. The ink reads best over short, even steps.

## Do not

- Hide the only copy of a price, a deadline or a legal term inside a closed panel.
- Use tabs for steps that must happen in order. That is a stepper, not tabs.

## Reduced motion

The accordion opens and closes at once, the ink jumps to the new tab, and the panels swap with no slide.

## Browser support

The accordion height uses `interpolate-size` and `::details-content` (Chrome 131 and later). Other browsers open the panel at once, and the answer still fades in. The tabs work in every current browser.
