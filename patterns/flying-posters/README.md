# Flying posters

As the page scrolls, posters fly out of the dark toward the viewer and past the camera, one after another, while the section holds still. Each poster owns its own stretch of the scroll, so scrolling back flies them away again.

[Live demo](https://motion.rujilabs.com/patterns/flying-posters/) · [style.css](style.css) · [flying-posters.js](flying-posters.js)

## Use

```html
<link rel="stylesheet" href="flying-posters/style.css">
<script src="flying-posters/flying-posters.js" defer></script>

<section class="fp" aria-label="Six screenings">
  <div class="fp-view">
    <ol class="fp-list">
      <li class="fp-poster">
        <img src="hujan.jpg" alt="">
        <h2>Hujan Petang di Balik Pulau</h2>
        <p>Fri 20 Nov, 8:00 pm</p>
      </li>
      <!-- 3 to 8 posters -->
    </ol>
  </div>
</section>
```

The script numbers the posters, scatters them left and right of the centre and turns the section on (`.fp-on`). The section then grows to one screen plus `--fp-gap` per poster, and its `.fp-view` sticks to the top while the posters fly. The last poster comes straight down the middle.

## Options

| Property | On | What it does | Default |
|---|---|---|---|
| `--fp-w` | `.fp` | Poster width | `220px` |
| `--fp-gap` | `.fp` | Scroll length added per poster | `55svh` |
| `--fp-span` | `.fp` | Share of the hold each poster takes to fly; more is slower and more overlap | `40%` |
| `--fp-depth` | `.fp` | Perspective; smaller rushes past harder | `700px` |
| `--fp-far`, `--fp-near` | `.fp` | Where a poster starts and ends on the z axis | `-1800px`, `520px` |
| `--fp-x`, `--fp-y` | `.fp-poster` | Its spot round the centre, in % of a poster. Set them to place posters by hand | scattered |

## Browser support

Browsers with scroll timelines run it in CSS: each poster's `fp-fly` animation sits on a slice of the section's view timeline. Elsewhere the same animation is paused and the script sets its time from the scroll position, once a frame, so the look is the same.

## Do

- Put the real line-up in the posters' text. Under reduced motion and without the script, they become a plain grid that has to stand alone.
- Keep it to one held section on a page. It is a scene, not a way to lay out content.

## Do not

- Do not put links or buttons on the posters. They are only readable for a moment as they pass.
- Do not use it for more than about 8 posters. The hold gets long and people lose their place.

## Reduced motion

The script does nothing and the section is a normal grid of posters: no hold, no flight.
