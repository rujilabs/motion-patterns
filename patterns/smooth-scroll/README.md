# Smooth scroll

In-page links glide to their section instead of jumping. A sticky header never covers the target, and when the glide ends the section lights up and draws a key line at its edge, so the eye knows where it landed. CSS only.

[Live demo](https://motion.rujilabs.com/patterns/smooth-scroll/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="smooth-scroll/style.css">

<html class="smooth-scroll">
  <a href="#leave">Leave</a>
  <section id="leave" class="smooth-target">…</section>
</html>
```

```css
html { --smooth-offset: 64px; }   /* the sticky header's height */
```

## Options

| Class or property | What it does |
|---|---|
| `.smooth-scroll` | On `<html>` or any scrolling box: smooth jumps, and room for a sticky header |
| `--smooth-offset` | Space kept above the target, default `0px` |
| `.smooth-target` | A section that lights up when it becomes the `:target` |
| `--smooth-mark` | The light, default a pale blue |
| `--smooth-line` | The key line colour, default `currentColor` |
| `--smooth-delay` | Wait before the light, default `350ms`, so it shows as the glide settles |

## Do

- Keep the jumps short: a contents list, a Back to the top link. A long glide over many screens feels slow.
- Give every target an `id` people can share. The address bar keeps the hash, so the link opens at the right place with the light.

## Do not

- Take over the wheel or trackpad to make all scrolling "smooth". People tune their own scrolling; leave it alone.
- Use the light on every heading. It marks the one place a link took you.

## Reduced motion

`scroll-behavior` stays `auto`, so the page jumps at once, and the target stays marked with no fade.
