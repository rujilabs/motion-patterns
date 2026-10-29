# Lever confirm

Use when: an action is big enough that a single click should not do it, such as sending a large bank transfer.

A lever on a bolted pivot, running in a curved groove from Rest to Send. Pull the handle all the way down and it latches and fires `confirm`. Let go anywhere short of the end and its spring throws it back up, where it knocks against the rest stop and settles. The arm has mass: while you pull, it trails your hand on a stiff spring instead of sticking to the pointer. The red ball keeps its highlight at the top left wherever it goes, because the light does not move with the arm. A line along the groove shows how far you have come.

[Live demo](https://motion.rujilabs.com/patterns/form-lever-confirm/) · [style.css](style.css) · [lever.js](lever.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="form-lever-confirm/style.css">
<script src="form-lever-confirm/lever.js" defer></script>

<button class="lever" type="button" aria-describedby="help status" data-status="status"
        data-pivot="56 115" data-length="140" data-rest="-38" data-end="38">
  <span class="lever-name">Send RM 12,480.00 to Lim Bina Kabinet</span>
  <svg viewBox="0 0 240 230" aria-hidden="true"><!-- copy the SVG from index.html --></svg>
</button>
<p id="help">Pull the handle all the way down to send. Or hold Space or Enter.</p>
<p id="status" role="status">Let go early and nothing is sent.</p>
```

```js
lever.addEventListener("confirm", () => sendTransfer());
lever.reset(); // let the latch go for the next one
```

The SVG in [index.html](index.html) has the groove, the progress line, the bracket, the rod and the ball. Its geometry must match the data attributes.

## How each person sends

| Input | What it takes |
|---|---|
| Mouse, pen, touch | Drag anywhere on the lever. The arm turns by how far you turn about the pivot, so a tap never jumps it to the end |
| Keyboard | Hold Space, Enter or Arrow Down for about a second. Let go early and it springs back |
| A tap, or a screen reader click | Two steps: the first pulls it halfway and says "Press again within 5 seconds to send", the second sends. After 5 seconds it springs back |

Every step is announced through the element named in `data-status`.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-pivot` | Pivot point in SVG units | `56 115` |
| `data-length` | Pivot to ball centre | `140` |
| `data-rest`, `data-end` | Angles of the two stops, in degrees clockwise from pointing right | `-38`, `38` |
| `data-status` | id of the live text to keep up to date | None |
| `--lever-size` | Width of the lever | `240px` |
| `--lever-ball`, `--lever-fill`, `--lever-steel`, `--lever-plate` | Handle, progress line, rod and boss, groove and bracket | Red, red, steel, light grey |

## Do

- Keep it for the one action on the page that cannot be undone, and say why it is there ("Over RM 10,000").
- Say what happened in words after it latches: the amount, who it went to, a reference.

## Do not

- Put it on every confirm. If people meet it ten times a day, it is a chore, not a safeguard.
- Hide the keyboard and two-tap paths. They are what make it usable for everyone.

## Reduced motion

The arm sits where your hand is, with no trailing spring. Let go early and it goes straight back to rest; no throw, no knock, no jolt at the latch.
