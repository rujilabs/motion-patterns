# Hamburger menu

A menu button whose three bars fold into an X, and the menu it opens. The bars move in two beats: opening, the outer bars slide to the middle and then turn; closing, they turn back and then slide apart. The menu unfolds from its top edge and the items drop in one after another.

[Live demo](https://motion.rujilabs.com/patterns/hamburger/) · [style.css](style.css) · [hamburger.js](hamburger.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="hamburger/style.css">
<script src="hamburger/hamburger.js"></script>

<button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menu">
  <span class="burger-box" aria-hidden="true">
    <span class="burger-bar"></span><span class="burger-bar"></span><span class="burger-bar"></span>
  </span>
</button>
<nav class="burger-menu" id="menu" aria-label="Main">
  <a href="/shop">Shop</a>
  <a href="/visit">Visit</a>
</nav>
```

Place and paint the button and the menu yourself; the pattern only moves them.

## Parts

| Class or attribute | What it does |
|---|---|
| `.burger-box` + three `.burger-bar` | The icon, 20 by 14 px. Bars take `currentColor` |
| `aria-expanded="true"` on the button | Folds the bars into an X. The script flips it; you can flip it yourself |
| `.burger-menu` | Hidden under `.js`; `.is-open` unfolds it from the top edge |
| `--i` on each menu child | Set by the script. Spaces the items one `--stagger` (80ms) apart, capped at 8 |

The script also closes the menu on Esc (focus goes back to the button), on a click outside and on a click on a menu link, and marks the closed menu `inert`.

## Do

- Keep `aria-label="Menu"` on the button. `aria-expanded` already tells a screen reader whether it is open.
- Use it only where the links do not fit. On a wide screen, show the links.

## Do not

- Spin the whole icon. The turn belongs to the two outer bars only.
- Hide the menu with `display: none` or `hidden`: that cuts the closing unfold. The script uses `inert` and the CSS uses `visibility`.

## Reduced motion

The icon swaps between bars and X at once, and the menu appears and disappears with no unfold.
