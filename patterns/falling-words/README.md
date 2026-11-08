# Falling words

A click knocks the words of a page over: each word drops with gravity, bounces a little, tips and piles up on the floor of the box. Reset flies them home. Made for a 404 or an empty state, where a little play softens the dead end.

[Live demo](https://motion.rujilabs.com/patterns/falling-words/) · [style.css](style.css) · [falling-words.js](falling-words.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="falling-words/style.css">
<script src="falling-words/falling-words.js" defer></script>

<section class="fw" data-fall-pit>
  <button type="button" data-fall-drop hidden>Knock them over</button>
  <button type="button" data-fall-reset hidden>Put them back</button>
  <p data-fall>404</p>
  <h1 data-fall>This shelf is empty.</h1>
  <p data-fall>The book you wanted sold on 14 March.</p>
  <p><a href="/">Back to the shop</a></p>
</section>
```

The box is the floor and the walls, so give it a height and keep `overflow: hidden`. The script wraps each word of every `[data-fall]` block in a span and leaves the text in place, so screen readers read the page as written. The buttons start `hidden` and the script shows them, so without JS there are no dead controls.

The fall is worked out in one go (about 1 ms for 25 words), then each word plays it as one Web Animation. There is no per-frame script, and the motion shows in DevTools like any other animation.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-fall-gravity` on the box | Pull, in px per frame squared at 60 fps | `0.55` |
| `data-fall-floor` on the box | Gap between the pile and the bottom edge, in px | `12` |
| `[data-fall]` | A block whose words fall. Clicking it drops them too | |
| `[data-fall-drop]` / `[data-fall-reset]` | Drop and reset buttons; they get `aria-disabled` when they would do nothing | |
| `.is-down` on the box | Set while the words lie in a pile | |

## Do

- Keep the links and the way out outside `[data-fall]`, so they never move. The pile lets clicks through to them.
- Keep it to one short block of words, 10 to 30. Past that the pile hides the page.

## Do not

- Do not use it on a page someone has to read to finish a task.
- Do not drop words on load. Let the person choose to knock them over.

## Reduced motion

The words do not fall: Knock them over shows the pile at once, and Put them back puts the words home at once.
