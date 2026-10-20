# Filter chips

Checkboxes drawn as chips. Turning one on opens a slot at its start, so the chip widens smoothly instead of jumping, and a check mark grows into the slot and draws itself. Turning it off runs the same steps back. CSS only.

[Live demo](https://motion.rujilabs.com/patterns/filter-chips/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="filter-chips/style.css">

<fieldset>
  <legend>Filters</legend>
  <label class="chip">
    <input type="checkbox" name="tag" value="veg">
    <svg class="chip-check" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 L5.6 10.4 L11.5 3.8" pathLength="1"/></svg>
    Vegetarian
  </label>
</fieldset>
```

Keep `pathLength="1"` on the path: the draw runs from 1 to 0 whatever the path's real length.

## Options

| Property | What it does | Default |
|---|---|---|
| `--chip-bg`, `--chip-line`, `--chip-ink` | Chip when off | white, `#d9dfe8`, `#1e2229` |
| `--chip-on-bg`, `--chip-on-line`, `--chip-on-ink` | Chip when on | `#dce7fd`, `#3d7bf2`, `#2456c4` |

The order of events: the slot opens, the check grows in on the spring curve, then the line draws. Each step starts a fraction of `--stagger` after the last.

## Do

- Wrap chips in a `<fieldset>` with a `<legend>`, so the group has a name.
- Count the chips that are on with a CSS counter (the demo does) or in your own script, and show a way to clear them.

## Do not

- Use chips for one-of-many choices. That is a segmented control or radio buttons.
- Put chips in a row that cannot wrap: each one grows when it turns on.

## Reduced motion

The chip changes colour and width at once, and the check shows complete.
