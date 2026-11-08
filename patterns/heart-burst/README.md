# Heart burst

A save button: the heart pops in on a spring, fills, and a ring and eight dots burst out from it. Unsaving is quiet, a small shrink while the fill fades, because taking something back is not a celebration.

[Live demo](https://motion.rujilabs.com/patterns/heart-burst/) · [style.css](style.css) · [heart-burst.js](heart-burst.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="heart-burst/style.css">
<script src="heart-burst/heart-burst.js" defer></script>

<button class="hb" type="button" aria-pressed="false" aria-label="Save recipe">
  <span class="hb-icon">
    <span class="hb-ring" aria-hidden="true"></span>
    <span class="hb-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
    <svg class="hb-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.6-4.6-8.6-9.6C2.7 7 5 4.4 7.9 4.4c1.8 0 3.2 1 4.1 2.4.9-1.4 2.3-2.4 4.1-2.4 2.9 0 5.2 2.6 4.5 6.2-1 5-8.6 9.6-8.6 9.6z"/></svg>
  </span>
</button>
```

```js
btn.addEventListener("change", () => save(btn.getAttribute("aria-pressed") === "true"));
```

Keep the label the same in both states ("Save recipe"): `aria-pressed` already tells screen readers whether it is on. A button that loads with `aria-pressed="true"` shows filled with no burst.

## Options

| Name | What it does | Default |
|---|---|---|
| `--hb-size` | Heart size; the burst scales with it | `28px` |
| `--hb-on` | Filled heart, ring and odd dots | `#e0344d` |
| `--hb-dot` | Even dots | `#f2a33a` |

## Do

- Use it for a small, happy, undoable act: save, like, add to a list.
- Say what happened in words nearby (a status line), not only with the heart.

## Do not

- Do not burst on a button people press many times in a row, like a quantity stepper.
- Do not use it for anything serious or costly, like a payment.

## Reduced motion

No pop, ring or dots. The heart just fills or empties.
