# Cursor follower

A soft dot trails the mouse pointer with a short lag and opens into a thin ring over links and buttons. The real cursor stays visible: the dot is a companion, not a replacement.

[Live demo](https://motion.rujilabs.com/patterns/cursor-follower/) · [style.css](style.css) · [follower.js](follower.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="cursor-follower/style.css">
<script src="cursor-follower/follower.js"></script>

<main data-follow>
  ...
  <span class="follow-dot" aria-hidden="true"></span>
</main>
```

If the area has no `.follow-dot`, the script adds one. Set its colour with `color` on `.follow-dot`.

## Options

| Class, attribute or property | What it does |
|---|---|
| `[data-follow]` | The area where the dot follows. It hides when the pointer leaves |
| `[data-follow-grow]` | Opens the ring over this element too (links and buttons do already) |
| `--follow-lag` | How far behind the dot runs. Default `300ms`. Under 150ms it feels glued, over 450ms it feels lost |
| `--follow-size` | The dot. Default `10px` |
| `--follow-ring` | The ring over links. Default `40px` |

How the lag works: the script only writes the pointer position into `--follow-x` and `--follow-y`. A CSS transition on `translate` does the rest. Every move restarts the transition from where the dot is at that moment, so it eases toward the newest point and never builds a queue.

## Do

- Keep it to one area, like a portfolio index or a gallery, where pointing is the point.
- Keep the dot pale and small. It should be noticed second, after the thing under the cursor.

## Do not

- Hide the system cursor. People lose the click point, and screen magnifiers follow the real cursor.
- Use it on forms or long reading pages. A moving dot next to text pulls the eye off the line.

## Reduced motion

The script does not start and the dot is hidden. Touch screens and pens never get it either: it needs a mouse that hovers.
