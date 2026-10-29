# Curve connector

Use when: people build a workflow by placing steps on a board, and the links between steps must follow wherever a step goes.

Each connector is a cubic curve from the out port on one step to the in port on the next, with level tangents at both ports, the way node editors draw them. Drag a step and both ends stay attached exactly. The two control points follow on springs, so a fast drag swings the belly of the curve and it settles a moment after you stop, like a cable with some weight. The reach of the curve grows with the gap, and a step dragged behind its source gets a wider loop, so the curve never kinks. The step you hold lifts off the board with a softer, longer shadow. On a narrow board the flow can run top to bottom instead, with the ports on the top and bottom edges.

[Live demo](https://motion.rujilabs.com/patterns/curve-connector/) · [style.css](style.css) · [connector.js](connector.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="curve-connector/style.css">
<script src="curve-connector/connector.js" defer></script>

<div class="curve-connector" id="board">
  <svg class="cc-wires" aria-hidden="true">
    <path class="cc-wire" data-from="order" data-to="kitchen"/>
  </svg>
  <div class="cc-node cc-start" id="order" tabindex="0" data-x="18" data-y="34"
       aria-roledescription="movable step" aria-describedby="hint">Order form sent</div>
  <div class="cc-node cc-end" id="kitchen" tabindex="0" data-x="246" data-y="128"
       aria-roledescription="movable step" aria-describedby="hint">Kitchen has room</div>
</div>
<p id="hint">Drag a step, or focus it and use the arrow keys.</p>
```

Give the board a height. `connector.js` places each step at its `data-x` and `data-y` (px from the top left), keeps it inside the board, and writes the new position back to those attributes.

```js
board.addEventListener("nodedrop", (e) => save(e.detail.id, e.detail.x, e.detail.y));
board.place("kitchen", 300, 90);                              // move a step from code
board.pulse(document.querySelector(".cc-wire"), 700).finished // a dot runs along one connector
  .then(() => markDone("kitchen"));
```

## Options

| Attribute, class or property | Does | Default |
|---|---|---|
| `data-x`, `data-y` (step) | Position in px from the board's top left | `0` |
| `data-from`, `data-to` (connector) | Ids of the two steps it joins | Required |
| `data-flow="down"` (board) | Ports on the bottom and top edges, curves run downward | Left to right |
| `.cc-start`, `.cc-end` | Hide the in port of a first step or the out port of a last one | Both ports |
| `--cc-wire`, `--cc-port`, `--cc-fill` | Connector, port ring, step and port fill | Ink, ink, white |
| `--cc-token`, `--cc-focus` | Test dot and focus ring | Green |

Events: `nodemove` on every move, `nodedrop` when a drag ends or a key moves a step. Keys: arrows move 8 px, Shift with an arrow 32 px.

## Do

- Snap the saved position to your grid on `nodedrop`, not during the drag. Snapping mid drag fights the hand.
- Keep the step's own text the source of truth for screen readers. The connectors are drawing, so they are `aria-hidden`; describe the flow in words somewhere too.

## Do not

- Animate the connectors when nothing moves. A wire that wobbles on its own looks broken.
- Use straight lines with arrowheads for a dense graph and this for a sparse one in the same product. Pick one.

## Reduced motion

The curve snaps to the steps with no spring, the lifted step does not scale, and a test dot goes straight to the end of its connector.
