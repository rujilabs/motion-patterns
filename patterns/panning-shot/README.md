# Panning shot

The camera follows a moving subject, so the subject stays sharp while the world behind it streaks in the direction of travel. The background starts still and picks up speed into the streak.

[Live demo](https://motion.rujilabs.com/patterns/panning-shot/) · [style.css](style.css)

## Use

Add the blur filter to the page once. It blurs along x only, which is what makes it read as speed and not as focus.

```html
<svg width="0" height="0" aria-hidden="true">
  <filter id="pan-streak" x="-5%" y="0" width="110%" height="100%" color-interpolation-filters="sRGB">
    <feGaussianBlur stdDeviation="14 0"/>
  </filter>
</svg>
```

Draw the background as one tile as wide as the frame (`--pan-w`), and lay it three times so the blurred edges never come into view. Two copies, one sharp and one streaked, then the subject on top:

```html
<section class="pan-group">
  <label class="pan-pause"><input type="checkbox"> Pause</label>
  <svg viewBox="0 0 320 200" role="img" aria-label="A rider on the park road">
    <defs><g id="tile"><!-- trees, fence, buildings --></g></defs>
    <g class="pan-sharp"><g class="pan-move"><use href="#tile"/><use href="#tile" x="320"/><use href="#tile" x="640"/></g></g>
    <g class="pan-blur"><g class="pan-move"><use href="#tile"/><use href="#tile" x="320"/><use href="#tile" x="640"/></g></g>
    <g class="subject"><!-- the rider --></g>
  </svg>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `.pan-move` | Slides its content one tile to the left on a loop |
| `--pan-w` | Tile width in SVG units (px). Default `320px` |
| `--pan-dur` | Time to pass one tile. Default `2s`; shorter is faster |
| `.pan-sharp`, `.pan-blur` | The still copy fades out as the streaked copy fades in |
| `.look-pan` | The streak alone, on any picture or section |
| `.pan-pause` inside `.pan-group` | A checkbox that pauses everything in the group |

The streak strength is the first number in `stdDeviation`. 8 to 16 reads as a fast pan; more becomes plain smear.

## Do

- Keep the subject in the middle third and give it small motion of its own, such as turning wheels or a slight bob.
- Streak along the direction of travel only. A blur in both directions reads as out of focus.

## Do not

- Streak the subject. The look depends on one sharp thing against a moving world.
- Run it behind text the reader needs; the moving background makes words hard to hold.

## Reduced motion

A still photograph of the pan: the background shows already streaked, the subject is sharp, and nothing moves. The pause toggle hides.
