# Tear ticket

Use when: a check-in, redemption or one-time pass should be used up by a gesture people already know, tearing the stub off a ticket.

A ticket with a perforated stub. Drag the stub down or to the right and it turns on its bottom corner, so the gap opens at the top as if the tear were running down the holes. Past a set distance it comes off and drops away, turning as it falls. Let go before that and it springs back on. The stub is a real button: Enter, Space or a plain click tear it in one go. A Reset button puts it back.

[Live demo](https://motion.rujilabs.com/patterns/tear-ticket/) · [style.css](style.css) · [tear-ticket.js](tear-ticket.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tear-ticket/style.css">
<script src="tear-ticket/tear-ticket.js" defer></script>

<div class="tt-group">
  <div class="tt" data-done="Checked in at 10:02 am.">
    <div class="tt-main">Kuala Perlis to Kuah, Langkawi, 10:15 am, RM 18.00</div>
    <button class="tt-stub" type="button" aria-label="Tear off the boarding stub to check in">Boarding 10:15</button>
  </div>
  <p class="tt-status" role="status"></p>
  <button type="button" data-tt-reset>Reset</button>
</div>
```

## Options

| Property or attribute | Does | Default |
|---|---|---|
| `data-tear` on `.tt` | Drag distance in px that tears the stub off | `110` |
| `data-done` | What `.tt-status` says once it is torn | `Stub torn off.` |
| `data-reset` | What it says after Reset | `Stub is back on.` |
| `--tt-paper` | Ticket colour | `#fff` |
| `--tt-notch` | Radius of the half-moon notches at the ends of the cut | `10px` |
| `--tt-hole` | Colour of the perforation holes | `rgb(0 0 0 / .3)` |
| `--tt-ring` | Focus ring on the stub | `#1e2229` |

| Input | Does |
|---|---|
| Drag the stub down or right | Tears as you go; past `data-tear` it comes off |
| Let go early | It springs back |
| Click, tap, Enter, Space | Tears it in one go |
| `[data-tt-reset]` | Puts the stub back and moves focus to it |

The ticket gets `.is-torn` and fires `tickettear`, and `ticketreset` after Reset. Do the real check-in in `tickettear`.

## Do

- Use it once per ticket, for something that really is used up.
- Say in words what happened, in `.tt-status`, and show it on the ticket too, like the stamp in the demo.

## Do not

- Ask for a tear to confirm something people do many times a day. The gesture is slow on purpose.
- Make the stub smaller than a thumb. It is the thing people grab.

## Reduced motion

Dragging still turns the stub under your finger, but once torn it disappears at once instead of falling, and it snaps back with no spring.
