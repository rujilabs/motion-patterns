# Paper crumple

Use when: discarding a note, card or reminder should feel light and reversible, like screwing up a slip of paper, with a Restore that brings it back.

The note's outline is a clip-path polygon of 20 points around its edge. On discard the points pull in toward a lumpy circle (each note has its own seeded lumps, so it always crumples the same way) while the note shrinks and turns, and fold lines darken over it. A paper ball in the note's own colour takes over where it folded up and is thrown into the bin on a real arc: steady speed across, constant gravity down, the top of the arc solved so it lands in the bin mouth. It drops in behind the bin's front and stays peeking over the rim, and the bin rocks. Restore plays the same timeline backwards: the ball jumps out, flies back and opens into the note.

[Live demo](https://motion.rujilabs.com/patterns/paper-crumple/) · [style.css](style.css) · [paper-crumple.js](paper-crumple.js)

## Use

```html
<link rel="stylesheet" href="paper-crumple/style.css">
<script src="paper-crumple/paper-crumple.js" defer></script>

<div class="crumple-board">
  <article class="crumple">
    <p>Order 40 kg santan from Pak Din before Thu 12 Nov, 10:30 am.</p>
    <button type="button" aria-label="Discard note: order santan">Discard</button>
    <svg class="crumple-creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 34L38 52 100 22M18 100L44 54 70 100M38 52L60 0"/>
    </svg>
  </article>
  <div class="crumple-bin" aria-hidden="true">...</div>
</div>
```

```js
note.crumple.discard();                       // fires "discarded" when the ball is in the bin
note.crumple.restore();                       // fires "restored" when the note is back
note.addEventListener("discarded", saveToBin);
```

The ball is coloured from the note's `background-color`. The note keeps its place in the layout while it is gone (`.is-gone` hides it), so nothing jumps; the demo draws a dashed outline in the empty slot.

## Options

| Name | What it does | Default |
|---|---|---|
| `--crumple-ball` | Size of the ball, on the board | `56px` |
| `.crumple-creases` | Your own fold lines, in a 0 to 100 box | |
| `T` in the script | Ms for the whole crumple and throw | `1500` |
| `PTS` in the script | Points on the outline | `20` |

## Do

- Put a Restore close by and keep the discarded item until the person leaves the page, as the demo does.
- Keep the bin in sight of the notes, so the arc reads as a throw and not a jump across the screen.

## Do not

- Do not use it to delete for good. A ball in a bin promises it can come out again.
- Do not change the layout between the throw and the restore: the ball flies to the place it measured at the start.

## Reduced motion

No crumple and no throw: the note is gone at once and back at once, and the events still fire.
