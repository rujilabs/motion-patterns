# Underline

Three hover underlines for links. Each line is a background, so it wraps with the text across lines and never moves the layout.

[Live demo](https://motion.rujilabs.com/patterns/underline/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="underline/style.css">

<nav><a class="ul-center" href="/stories">Stories</a></nav>
<p>See our <a class="ul-left" href="/starter">guide to a first starter</a>.</p>
<footer><a class="ul-through" href="/archive">Archive</a></footer>
```

## Variants

| Class | At rest | On hover or focus | Use for |
|---|---|---|---|
| `.ul-left` | No line | Draws in from the left and goes back the way it came | Links inside body copy |
| `.ul-center` | No line | Grows out from the middle and shrinks back into it | Short, centred nav items |
| `.ul-through` | Line shown | The line slides off to the right while a fresh one slides in from the left | Footer and index links that must look like links before hover |

| Property | Default | What it does |
|---|---|---|
| `--ul-w` | `1px` | Line thickness |
| `--ul-gap` | `2px` | Space between the text and the line |
| `--ul-color` | `currentColor` | Line colour |

[Draw](../draw/) has a fourth: `.draw-hover`, which enters from the left and leaves to the right.

## Do

- Pick one variant per region of a page (nav, body, footer). Mixing them in one paragraph looks like a mistake.
- Keep `.ul-through` for links that show a line at rest. In body copy, readers need to see what is a link before they hover.

## Do not

- Use `.ul-left` or `.ul-center` on body links that have no other cue (colour or weight). A link that only shows itself on hover is invisible on touch screens.
- Thicken the line past about 3px: the background then starts to read as a highlight.

## Reduced motion

`.ul-left` and `.ul-center` show their full line on hover at once. `.ul-through` keeps its line still; it is already shown at rest.
