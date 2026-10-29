# Light scan verify

Use when: an uploaded document (an ID card, a licence, a utility bill) is being checked, and people should see it being read rather than wait on a spinner.

A scanner lamp passes over the document once, at the steady speed of a scanner carriage. The lamp is a thin line of light with the falloff of a line source on paper, `1 / (1 + (d/h)²)`, blended with screen, so it brightens what is under it and never covers it. Behind it the photo's uneven light is gone: the warm cast of the desk lamp and the dark corner where a hand shaded it stay only below the line, so the page reads as evenly lit once it has been scanned. Each field gets a box the moment the line reaches its middle, and the check that names it ticks a beat later, so the list fills in the order the lamp reads, not on a timer of its own. One pass takes 1.7 seconds.

[Live demo](https://motion.rujilabs.com/patterns/light-scan-verify/) · [style.css](style.css) · [light-scan-verify.js](light-scan-verify.js)

## Use

```html
<link rel="stylesheet" href="light-scan-verify/style.css">
<script src="play.js"></script>  <!-- marks <html class="js">, so the waiting state only shows with script -->
<script src="light-scan-verify/light-scan-verify.js" defer></script>

<div class="scan-doc" data-scan-list="#checks" role="img" aria-label="Photo of the front of your ID card">
  <img src="upload.jpg" alt="">
  <span data-scan-field="name">TAN MEI LING</span>
  <div class="scan-shade"></div>
</div>
<ul id="checks">
  <li data-scan-for="*">Card edges found</li>
  <li data-scan-for="name">Name read</li>
</ul>
```

```js
doc.addEventListener("scan", () => next.disabled = false);
retry.addEventListener("click", () => doc.scan.run());
```

The pass shows the check; it does not do it. Start it when the upload lands, and when your real check comes back, write the result as text next to the list. If the check fails, say what failed in words. `.scan-shade` is yours to paint with the light the photo was taken in; leave it out for a clean scan.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-duration` | One pass, in ms | `1700` |
| `data-scan-list` | Selector of the list of checks | none |
| `data-scan-field` | On a field: its name. A box goes round it when the lamp reaches its middle | |
| `data-scan-for` | On a list item: the field it waits for, or `*` for the start | |
| `--scan-light`, `--scan-box`, `--scan-band` | Lamp colour, box colour, height of the lit band | Cool green white, coral, `120px` |
| `.is-scanning`, `.is-done` | Classes on the document during and after the pass | |
| `el.scan.run()` | Runs it again | |

## Do

- Keep the lamp at a constant speed. A carriage does not ease in and out, and the ticks line up with it.
- Order the list top to bottom, the way the lamp reads the page.
- Keep it under 2 seconds. It is there to show progress, not to be watched.

## Do not

- Run it on a loop while you wait for a slow server. Pass once, then say "Still checking" in words.
- Put the lamp over a document the reader cannot see. The point is seeing their own card being read.

## Reduced motion

No lamp and no pass. The document shows as read, with its boxes, and every check that passed is ticked at once.

## See also

[`light-sweep`](../light-sweep/), a band of light over a button or a logo, with no reading behind it.
