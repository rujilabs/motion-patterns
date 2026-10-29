# Search field morph

Use when: a site header has no room for a full search field, and the search should open where the icon is.

The magnifier opens into the field. The lens and the field outline are one path, a stadium: two half circles joined by two straight lines. Closed, the lines have no length, so the stadium is the round lens. Open, they run the width of the header and the ends grow to half the field's height, so the lens stretches sideways into the field and never folds or crumples. The handle slides down its own diagonal and grows into one stroke of the close cross, and the other stroke draws across it. Escape runs it all backwards and puts focus back on the button.

[Live demo](https://motion.rujilabs.com/patterns/morph-search-field/) · [style.css](style.css) · [search-morph.js](search-morph.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="morph-search-field/style.css">
<script src="play.js"></script>
<script src="morph-search-field/search-morph.js" defer></script>

<form class="search-morph" role="search" action="/search">
  <svg class="sm-shape" aria-hidden="true">
    <path class="sm-ring"/><path class="sm-handle"/><path class="sm-cross"/>
  </svg>
  <input class="sm-input" type="search" name="q" placeholder="Title, author or ISBN" aria-label="Search books">
  <button class="sm-toggle" type="button" aria-expanded="false" aria-label="Open search"></button>
</form>
```

Make the form as wide as the open field should be, and lay it over whatever it covers when open (the demo puts the nav and the form in the same grid cell). Closed, only the lens at its right end shows and takes clicks. `play.js` marks the page with `.js`; without it the form is an ordinary search field with a border, and it still submits.

## Options

| Attribute, event or property | Does | Default |
|---|---|---|
| `aria-controls` on the input | Id of your results panel. Focus moving into it keeps the field open | None |
| `data-label-open`, `data-label-close` on the button | Its accessible name in each state | `Open search`, `Close search` |
| `search-morph` event | Fires on the form with `detail.open` | |
| `SearchMorph.open(form)`, `SearchMorph.close(form)` | Open or close from code | |
| `--sm-h` | Field height. The closed button is a square of this size | `44px` |
| `--sm-ink`, `--sm-face` | Outline and icon colour, and the field fill | Near black, transparent |
| `--sm-stroke` | Line weight. It thickens by 0.75px while the field has focus | `1.75px` |

Keys: the button opens and closes it, Escape closes it from the field, and `/` opens it from anywhere that is not a text field. Focus leaving an empty field for the rest of the page closes it.

## Do

- Put the lens where your header already had its search icon, at the right end. The field grows back over the nav, which the demo fades out a moment ahead of it.
- Show something useful the moment it opens: recent or popular searches, then live results as people type.
- Keep the close cross where the lens was, so the same spot opens and closes it.

## Do not

- Open it on hover. A field that grows under a passing cursor steals the nav from people who were aiming for it.
- Use it when search is the main job of the page. Then the field should just be there, open.
- Draw the lens or field in CSS borders as well. The path is the outline; a second one shows double at the ends.

## Reduced motion

The field and the cross appear at once, and the lens comes back at once. Escape, the shortcut and focus all work the same.
