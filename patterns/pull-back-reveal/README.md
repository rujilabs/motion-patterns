# Pull-back reveal

The view starts filled by one item, then pulls back on a decelerating curve to show it is one of many, with neighbours arriving by distance.

[Live demo](https://motion.rujilabs.com/patterns/pull-back-reveal/) · [style.css](style.css) · [pull-back-reveal.js](pull-back-reveal.js)

## Use

```html
<div class="pb-world"><div class="pb-shelf">
  <i class="pb-item"></i>
  <i class="pb-item is-pick"></i>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `--from` | Starting zoom. The JS fits the pick to the frame height |
| `--d` | Distance from the pick, sets the arrival delay |

## Do

Start on the item that matters, so the first second already says something. End on a view with a clear next step.

## Do not

Do not pull back on every section: it is one moment per page. Do not start on an item whose text blurs when enlarged, use type large enough at both sizes.

## Reduced motion

The full shelf shows at once.
