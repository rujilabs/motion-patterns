# Image trail

Small photos drop where the pointer has been: each one pops in, drifts on a little the way the hand moved, and fades. A photographer's work shows up wherever the visitor looks.

[Live demo](https://motion.rujilabs.com/patterns/image-trail/) · [style.css](style.css) · [image-trail.js](image-trail.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="image-trail/style.css">
<script src="image-trail/image-trail.js" defer></script>

<section class="it" data-trail-gap="80" data-trail-pool="8">
  <h1>Weddings and quiet streets, shot in Ipoh.</h1>
  <ul class="it-strip">
    <li><img src="photos/limestone-dawn.jpg" alt="Limestone hills at dawn"></li>
    <!-- 4 to 8 photos -->
  </ul>
</section>
```

The strip is the content: without the script, and under reduced motion, it shows as a plain row. With the script the strip hides and its photos feed the trail. Put your text above the trail with `position: relative; z-index: 1`.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-trail-gap` | Pointer travel in px between two photos | `80` |
| `data-trail-pool` | Images made once and reused in turn | `8` |
| `data-trail-life` | Time from pop in to gone, in ms | `1100` |
| `--it-w` | Width of one photo | `112px` |

The pool never grows, so a long wiggle costs nothing. On touch the area keeps `touch-action: pan-y`: a sideways drag draws the trail and an up or down drag still scrolls the page.

## Do

- Use small, already resized photos (about 240 px wide). The trail loads every one of them.
- Keep the text short and big so the trail does not hide it.

## Do not

- Do not put buttons or links where the trail runs: the photos sit over them.
- Do not use it for photos people need to look at closely. That is a gallery.

## Reduced motion

No trail. The photos show as the still row under the text.
