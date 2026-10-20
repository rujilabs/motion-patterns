# Pinning

A section that holds still while the reader keeps scrolling. Its content steps through a few stages, a line fills to show how far along they are, and when the last stage is done the section lets go and the page scrolls on. No JavaScript.

[Live demo](https://motion.rujilabs.com/patterns/pinning/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="pinning/style.css">

<section class="pin" aria-label="How it works">
  <div class="pin-frame">
    <span class="pin-progress"></span>
    <ol class="pin-steps">
      <li class="pin-step">...</li>
      <li class="pin-step">...</li>
      <li class="pin-step">...</li>
    </ol>
  </div>
</section>
```

## Parts

| Class or property | What it does |
|---|---|
| `.pin` | The track. One screen tall per step, and a named view timeline (`--pin`) |
| `--pin-n` on `.pin` | Number of steps. Default `3`, up to 6 |
| `.pin-frame` | Sticks to the top for the length of the track. One screen tall |
| `.pin-step` | Each owns one slice of the track: it comes up 32px, holds, and leaves upward. The first is already there when the pin starts; the last stays when it ends |
| `.pin-progress` | Scales from 0 to full width across the whole pin. Give it a height and colour |

## How it works

The steps share one grid cell. Each runs the same keyframes on the `--pin` view timeline, with `animation-range: contain` cut into `--pin-n` slices by its index. The fades are short (15% of a slice) so two steps never sit half visible on top of each other.

## Browser support

Scroll timelines run in Chromium browsers and are arriving elsewhere. Where they are missing, the pin turns off: the track takes its natural height and the steps show as a plain list.

## Do

- Keep it to three or four steps. Each step costs the reader a screen of scrolling.
- Show the progress line, so the reader knows the page has not stuck.

## Do not

- Put `overflow: hidden` on any ancestor of `.pin`. It breaks both `position: sticky` and the timeline; use `overflow: clip`.
- Pin the first screen of a page. Let the reader scroll into it.

## Reduced motion

Nothing pins and nothing moves: the steps show as a list, one after another.
