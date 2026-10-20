# Dropdown

A menu that unfolds out of its trigger. The scale grows from the corner nearest the button, so a menu that has to open upward, or align to the right, still visibly comes out of the button that opened it. It unfolds more in height than in width, the items arrive one short step apart, and it closes quicker, all at once.

[Live demo](https://motion.rujilabs.com/patterns/dropdown/) · [style.css](style.css) · [dropdown.js](dropdown.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dropdown/style.css">
<script src="dropdown/dropdown.js" defer></script>

<div class="dropdown">
  <button type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="sort">
    Sort: <span data-label>Newest</span>
  </button>
  <ul class="dropdown-menu" id="sort" role="menu" aria-label="Sort" data-pick>
    <li role="menuitemradio" aria-checked="true">Newest</li>
    <li role="menuitemradio" aria-checked="false">Oldest</li>
  </ul>
</div>
```

Style the menu's paper and rows yourself. The pattern positions, unfolds and staggers it.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.dropdown` | The positioning box around the button and its menu |
| `.dropdown-menu` | Unfolds from the corner next to the button; items stagger in |
| `data-side`, `data-align` | Set by `dropdown.js` from the room around the button: `bottom` or `top`, `start` or `end`. Set them yourself to force a side |
| `data-pick` on the menu | A choice menu: the chosen item gets `aria-checked`, and `[data-label]` in the button shows it |
| `--dd-in` / `--dd-out` | Default 240ms ease-out open, 120ms ease-in close |
| `--dd-gap` | Space between button and menu. Default `6px` |

## Do

- Keep menus short: under eight items. The stagger stops growing after eight, but a long menu wants search, not motion.
- Let the keyboard in: arrows, Home, End and Esc are handled, and focus goes back to the button.

## Do not

- Stagger the close. Once something is chosen, the menu should be gone.
- Scale from the centre. A menu that grows from its middle looks like it came from nowhere.

## Reduced motion

The menu appears and disappears at once, with no unfold and no stagger.
