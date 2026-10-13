# Marquee

An endless row of logos or words, with edge fades, a pause control and a readable fallback.

[Live demo](https://motion.rujilabs.com/patterns/marquee/) · [style.css](style.css)

## Use

The track holds the content twice; the second copy is `aria-hidden`.

```html
<section class="marquee-group">
  <label class="marquee-pause"><input type="checkbox"> Pause</label>
  <div class="marquee" role="region" tabindex="0" aria-label="Shops that stock us">
    <div class="marquee-track">
      <ul>…items…</ul>
      <ul aria-hidden="true">…same items…</ul>
    </div>
  </div>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `--marquee-dur` | Time for one full loop. Default `38s`. Slower is almost always better |
| `--marquee-fade` | Width of the edge fade. Default `48px` |
| `.marquee-solid` | No edge fade |
| `.marquee-reverse` | Runs right to left reversed; pair it with a normal row for a double band |
| `.marquee-pause` inside `.marquee-group` | A checkbox that pauses every row in the group |

Hover and keyboard focus on a row pause it too.

## Do

- Include the pause toggle when the row carries information, such as logos or names. [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) asks for a way to stop movement that lasts over 5 seconds.
- Mark a purely decorative second row `aria-hidden="true"` as a whole.

## Do not

- Put links or buttons in a moving row: they are hard to hit.
- Speed it up to fit more in. If the list is long, it belongs in a grid.

## Reduced motion

The row stops, the duplicate is hidden, the first copy wraps onto as many lines as it needs, and the toggle hides.
