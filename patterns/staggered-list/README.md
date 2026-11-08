# Staggered list

A live queue. The rows slide in one after another, one highlight slides to the row picked with Up and Down (or a tap), and a new row slides in at the top while the rows below make room for it. The selection stays on the same row when new ones arrive.

[Live demo](https://motion.rujilabs.com/patterns/staggered-list/) · [style.css](style.css) · [staggered-list.js](staggered-list.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="staggered-list/style.css">
<script src="staggered-list/staggered-list.js" defer></script>

<h2 id="queue-h">Order queue</h2>
<ul class="sl" aria-labelledby="queue-h" data-sl-max="7">
  <li class="sl-row">#218 T3, kopi O peng x2, RM 8.60</li>
  <li class="sl-row">#217 Tapau, teh tarik, RM 11.40</li>
  <!-- more rows -->
</ul>
```

```js
// a new order: it slides in at the top
var li = document.createElement("li");
li.className = "sl-row";
li.textContent = "#219 T6, ais kacang, RM 10.70";
StaggeredList.add(document.querySelector(".sl"), li);
```

The script turns the list into a listbox (Tab to it, then Up, Down, Home, End) and adds the highlight as `.sl-mark`. Give the rows a transparent background so the highlight shows behind them, and colour the picked row with `.sl-row[aria-selected="true"]`.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-sl-max` | Rows kept; older rows past it fade out from the bottom | `8` |
| `data-sl-selected` on a row | Starts the selection on that row | the first row |
| `--sl-fresh` | Tint a new row keeps for a moment | warm yellow |
| `StaggeredList.play(list)` | Runs the entrance again (a Replay button) | |
| `StaggeredList.add(list, li)` | Slides a new row in at the top | |
| `sl:select` event | Fires on the list when the pick changes, with `detail.row` | |

The stagger step is `--stagger` and stops growing after 8 rows, so a long list never makes anyone wait.

## Do

- Use it for a list that changes while people watch it: orders, tickets, a delivery run.
- Keep the selection on the same item when rows arrive, as here, so nobody loses their place.
- Give a list that fills itself a Pause control.

## Do not

- Do not add rows faster than about one every 2 seconds: nobody can read a list that keeps jumping.
- Do not put links or buttons inside the rows: a listbox row is one thing to pick. Act on the pick outside the list.

## Reduced motion

Nothing slides. The rows are there at once, the highlight jumps to the picked row and a new row simply appears at the top.
