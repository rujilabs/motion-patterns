# Gear settings icon

Use when: an app nav has a settings button, and you want the cog to answer a hover and the opening of its panel.

A two-cog settings icon. It turns one tooth on mouse hover or when Tab brings focus to it, two teeth forward when its panel opens and two back when it closes. The small cog is meshed with the big one at the right phase, so it turns the other way, ten sevenths as fast. A whole number of teeth leaves the icon looking exactly as it started, so it never rests crooked, and every turn lands on the spring token.

[Live demo](https://motion.rujilabs.com/patterns/gear-settings-icon/) · [style.css](style.css) · [gear-settings-icon.js](gear-settings-icon.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="gear-settings-icon/style.css">
<script src="gear-settings-icon/gear-settings-icon.js" defer></script>

<button type="button" class="gear-settings-icon" aria-expanded="false" aria-controls="settings">
  <svg viewBox="-12 -12 24 24" data-module="1.35" aria-hidden="true">
    <g class="gs-gear" data-teeth="10" data-x="-3.2" data-y="3.2"></g>
    <g class="gs-gear" data-teeth="7" data-mesh="0" data-dir="-45"></g>
  </svg>
  <span>Settings</span>
</button>
```

Your own code opens the panel and sets `aria-expanded`. The cog watches that attribute, so it follows any way the panel opens or closes: a click, Esc or a route change.

## Options

| Attribute | Does | Default |
|---|---|---|
| `data-hover-teeth` | Teeth to turn on hover and on keyboard focus | `1` |
| `data-open-teeth` | Teeth to turn on open (and back on close) | `2` |
| `data-module` (on the svg) | Tooth size in svg units | `1.25` |
| `data-addendum` (on the svg) | Tooth height in modules. Stub teeth read better small | `0.8` |
| `data-teeth`, `data-x`, `data-y` | The first cog: tooth count and centre | |
| `data-mesh`, `data-dir` | A cog that meshes: the index of its partner and the angle to it | |
| `--gs-size` | Icon size | `28px` |

The cogs fill with `currentColor`, so the button's text colour colours them.

## Do

- Keep the turns to a tooth or two. It is a nod, not a show.
- Let `aria-expanded` drive it, so the icon and the panel can never disagree.

## Do not

- Spin the cog while a page loads. That is a spinner's job.
- Use fewer than 7 teeth: the teeth come to a point.

## Reduced motion

The cogs never turn. Hover, focus and opening the panel change nothing on the icon.
