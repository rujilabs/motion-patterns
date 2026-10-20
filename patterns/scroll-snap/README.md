# Scroll snap

Full-height sections that the scroll settles on, one at a time. The section that arrives lifts its content in, and a dot rail on the side marks it by stretching its dot into a pill. The snapping is plain CSS; a small script only says which section is in view.

[Live demo](https://motion.rujilabs.com/patterns/scroll-snap/) · [style.css](style.css) · [snap.js](snap.js)

## Use

```html
<html class="snap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="scroll-snap/style.css">
<script src="scroll-snap/snap.js"></script>

<nav class="snap-dots" aria-label="Steps">
  <a href="#s1" aria-label="Step 1"></a>
  <a href="#s2" aria-label="Step 2"></a>
</nav>
<section class="snap-section" id="s1">
  <h2 class="snap-in">Brew the tea strong</h2>
  <p class="snap-in">...</p>
</section>
<section class="snap-section" id="s2">...</section>
```

Put `.snap` on `<html>` to snap the whole page, or on any box with a fixed height and `overflow-y: auto`. Place and colour the dot rail yourself (the dots take `currentColor`).

## Parts

| Class | What it does |
|---|---|
| `.snap` | `scroll-snap-type: y mandatory`, smooth scrolling for the dot links |
| `.snap-section` | A stop, at least one screen tall, with `scroll-snap-stop: always` so a fast flick still stops at each one |
| `.snap-in` | Rises `--rise-y` and fades in when its section becomes active; siblings one `--stagger` apart |
| `.snap-dots a` | 8px dots; the active one (`aria-current="true"`) stretches to 24px on the spring |
| `.is-active` | Set by the script on the section that is at least 60% in view |

## Do

- Keep each section's content shorter than the screen. With mandatory snapping, content below the fold of a section is hard to reach.
- Give the dot links real labels; they are the keyboard way to jump between sections.

## Do not

- Snap long reading pages. Snapping fights a reader who wants to scroll a little.
- Hide the content of inactive sections without the script's `.js` class. Without the script, `.snap-in` shows.

## Reduced motion

Sections still snap (the scroll is the reader's own movement), but the jump from a dot link is instant, the content shows without rising, and the dots change at once.
