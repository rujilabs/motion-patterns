# Headline floor

Large repeated titles lie flat on a tilted floor, rows scrolling in opposite directions, with one object resting above them casting a shadow.

[Live demo](https://motion.rujilabs.com/patterns/headline-floor/) · [style.css](style.css) · [headline-floor.js](headline-floor.js)

## Use

```html
<div class="hf-scene"><div class="hf-floor">
  <div class="hf-row"><span>Title / Title / </span><span aria-hidden="true">Title / Title / </span></div>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `46s duration` | Scroll speed. Long, so the words stay readable |
| `rotateX(60deg)` | Floor tilt. Past 70 degrees the letters stop reading |

## Do

Use real titles or names from the page, and keep the floor behind one clear object.

## Do not

Do not make the floor the only place a title appears: the moving copies are decoration. It keeps moving, so always give a pause control.

## Reduced motion

The rows stay still at their start position.
