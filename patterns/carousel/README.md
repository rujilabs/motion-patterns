# Carousel

A row of slides on native scroll snap. Swipe, trackpad, keyboard and the buttons all move the same scroller, so nothing fights the browser. The slide in the centre grows to full size while its neighbours sit back a little, and the dots follow: the current dot stretches into a short bar.

[Live demo](https://motion.rujilabs.com/patterns/carousel/) · [style.css](style.css) · [carousel.js](carousel.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="carousel/style.css">
<script src="carousel/carousel.js" defer></script>

<div class="carousel" data-carousel role="region" aria-roledescription="carousel" aria-label="Rooms">
  <div class="carousel-track" tabindex="0">
    <article class="carousel-slide" aria-roledescription="slide" aria-label="1 of 3">...</article>
    <article class="carousel-slide" aria-roledescription="slide" aria-label="2 of 3">...</article>
    <article class="carousel-slide" aria-roledescription="slide" aria-label="3 of 3">...</article>
  </div>
  <button type="button" class="carousel-prev" aria-label="Previous">...</button>
  <div class="carousel-dots"></div>
  <button type="button" class="carousel-next" aria-label="Next">...</button>
</div>
```

The script adds one dot per slide into `.carousel-dots`.

## Options

| Class or property | What it does | Default |
|---|---|---|
| `--slide-w` | Width of one slide; the rest of the row shows the neighbours | `72%` |
| `--slide-gap` | Space between slides | `12px` |
| `--carousel-dot`, `--carousel-dot-on` | Dot colours | `#c9d1dc`, `#1e2229` |
| `.is-active` | Set by `carousel.js` on the centred slide and its dot | |

Slides that are not centred are `inert`, so Tab never lands on a link you cannot see whole.

## Do

- Show part of the next slide, so people can see there is more to swipe.
- Keep it to a handful of slides of the same kind: rooms, photos of one product, plans.

## Do not

- Turn on autoplay. If you must, it needs a pause button, and most people will never see slide 4 anyway.
- Put the only copy of something important on a later slide.

## Reduced motion

Buttons and dots jump straight to the slide, and the slides and dots change size at once.
