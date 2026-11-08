# Scroll speed marquee

An endless row that answers the scroll. A fling down makes it race, scrolling up runs it backwards, and when the page stops it eases back to its own slow pace.

[Live demo](https://motion.rujilabs.com/patterns/scroll-speed-marquee/) · [style.css](style.css) · [scroll-speed-marquee.js](scroll-speed-marquee.js)

## Use

The track holds the content twice; the second copy is `aria-hidden`. The pause button starts `hidden`: the script shows it.

```html
<link rel="stylesheet" href="scroll-speed-marquee/style.css">
<script src="scroll-speed-marquee/scroll-speed-marquee.js"></script>

<section class="ssm-group">
  <button class="ssm-pause" type="button" aria-pressed="false" hidden>Pause</button>
  <div class="ssm" role="region" tabindex="0" aria-label="Opening hours">
    <div class="ssm-track">
      <ul>...items...</ul>
      <ul aria-hidden="true">...same items...</ul>
    </div>
  </div>
</section>
```

## Options

| Class or attribute | What it does |
|---|---|
| `--ssm-dur` on `.ssm` | Time for one loop at the base pace. Default `30s` |
| `.ssm-reverse` | Runs the other way. A scroll down still speeds it up in its own direction |
| `data-ssm-gain` on `.ssm-group` | Extra speed per px/s of scroll. Default `0.008`: a 1,000 px/s fling runs it 9 times faster. Capped at 10 times either way |
| `.ssm-pause` | A button with `aria-pressed` that stops every row in the group |

## Do

- Keep the base pace slow. The scroll is what makes it lively; at rest it should be easy to read.
- Keep the pause button. [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) asks for a way to stop movement that lasts over 5 seconds.

## Do not

- Put links or buttons in the moving row.
- Raise the gain until a normal scroll blurs the text. A wheel step should nudge it, a fling should make it race.

## Reduced motion

The rows stop, the copies are hidden, each row wraps onto as many lines as it needs, and the button hides. Without the script the row runs at its base pace and ignores the scroll.
