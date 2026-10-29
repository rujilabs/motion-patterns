# Gear rack progress

Use when: a long article needs a reading-progress bar, and the page has room for one with some character.

As the reader scrolls, a pinion turns and drives a toothed rack out across the top of the page. The rack's leading end is the progress. It moves exactly one tooth pitch (pi times the module) for every tooth the pinion turns, so the two never slip, and a pinion tooth always sits in a rack gap. The rack has a little mass: it follows the scroll on a critically damped spring, so it starts a beat late and lands without bouncing.

[Live demo](https://motion.rujilabs.com/patterns/gear-rack-progress/) · [style.css](style.css) · [gear-rack-progress.js](gear-rack-progress.js)

## Use

```html
<link rel="stylesheet" href="gear-rack-progress/style.css">
<script src="gear-rack-progress/gear-rack-progress.js" defer></script>

<div class="gear-rack-progress" data-for="#story" aria-label="Reading progress"></div>
<article id="story">...</article>
```

Leave out `data-for` to follow the whole page. The bar is a `role="progressbar"` with `aria-valuenow` and `aria-valuetext` ("42% read"). To show minutes left, listen for its event:

```js
bar.addEventListener("rackprogress", function (e) { console.log(e.detail.progress); });
```

## Options

| Attribute | Does | Default |
|---|---|---|
| `data-for` | Selector of the element that scrolls | the page |
| `data-teeth` | Pinion tooth count | `12` |
| `data-module` | Tooth size in px. The bar's height follows it | `2.6` |
| `data-weight` | Spring stiffness. Higher follows tighter, `0` locks it to the scroll | `16` |
| `--grp-rack`, `--grp-pinion`, `--grp-axle`, `--grp-track` | Colours | |

## Do

- Put it in a header that stays put while the text scrolls under it.
- Keep it to one per page.

## Do not

- Use it on short pages. Under two screens the rack barely moves.
- Set a heavy weight on a progress bar people rely on. Past about 8 it feels sluggish.

## Reduced motion

The spring is off: the rack follows the scroll exactly, with no lag. The pinion still turns with it, because that is the progress itself.
