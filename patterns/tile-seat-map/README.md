# Tile seat map

Use when: people pick seats from a plan, at a cinema, a theatre, a bus or a flight.

A seat map built from tiles that behave like real seats. Every seat has a back and a tip-up cushion on a hinge. An empty seat's cushion is folded up toward you, so it reads short and a shade darker; hover and it starts to come down. Pick a seat and the cushion folds down on a spring while the whole seat pops up and settles. A taken seat already has its cushion down, in the taken colour; tap it and it shakes no, and the status line names the nearest free seat in that row.

[Live demo](https://motion.rujilabs.com/patterns/tile-seat-map/) · [style.css](style.css) · [tile-seat-map.js](tile-seat-map.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tile-seat-map/style.css">
<script src="tile-seat-map/tile-seat-map.js" defer></script>

<div class="seat-map" role="grid" aria-label="Seats in Hall 3, screen at the top" data-max="6" data-status="seat-status">
  <div role="row">
    <span role="rowheader" aria-label="Row E">E</span>
    <span role="gridcell"><button type="button" class="seat" aria-pressed="false" aria-label="E1, RM 16.00" data-seat="E1"><span class="seat-back"></span><span class="seat-cushion"></span></button></span>
    <span role="gridcell" class="seat-aisle"><button type="button" class="seat" aria-disabled="true" aria-label="E2, taken"><span class="seat-back"></span><span class="seat-cushion"></span></button></span>
  </div>
</div>
<p id="seat-status" role="status"></p>
```

It is an ARIA grid of real buttons. One seat is in the Tab order at a time. Picked seats carry `aria-pressed="true"`; taken seats carry `aria-disabled="true"` and stay focusable, so a screen reader user can find them and hear why they cannot have them. Listen for `seatchange` (`detail.seats`, like `["E5", "E6"]`) to total the order.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-max` | Most seats one person can pick | No limit |
| `data-status` | Id of the `role="status"` line the map writes to | None |
| `.seat-aisle` (on a gridcell) | Leaves an aisle before that seat | |
| `--seat-w`, `--seat-h`, `--seat-gap`, `--seat-aisle` | Seat size and spacing | `30px`, `28px`, `6px`, `16px` |
| `--seat-free`, `--seat-pick`, `--seat-taken`, `--seat-ring` | Colours | Lilac grey, marigold, plum, dark plum |
| Keys | Arrows by one seat, Home and End to the row ends, Ctrl with Home or End to the corners, Page Up and Page Down to the front and back rows, Enter or Space to pick | |

## Do

- Write the row and seat into every label, with the price or "taken": "E7, RM 16.00".
- Give the selection back in words next to the pay button, as the demo does.

## Do not

- Remove taken seats from the Tab order. A gap a person cannot reach is a seat they cannot ask about.
- Show colour alone. The folded and unfolded cushion is a second cue; keep a legend too.

## Reduced motion

Seats change colour and the cushion jumps to its place. Nothing pops and nothing shakes; the status line still says what happened.
