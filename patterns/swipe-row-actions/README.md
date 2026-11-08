# Swipe row actions

Use when: clearing a list of notifications on a phone, such as the delivery updates in a courier app's inbox.

Each row sits on top of its actions. Drag a row left and Archive and Delete show behind it. Let go past half their width and the row springs open; short of that it slides shut. Past either end it stretches like rubber, giving less the further you pull. Keep going past 55 percent of the row and Delete folds away so Archive fills the gap: let go there and the row slides off and its height closes up. Only one row is open at a time, and a tap on any row shuts the open one.

Nothing is touch only. The dots button on each row opens the same actions and moves focus to Archive, so a mouse, a keyboard and a screen reader all get there.

[Live demo](https://motion.rujilabs.com/patterns/swipe-row-actions/) · [style.css](style.css) · [swipe.js](swipe.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="swipe-row-actions/style.css">
<script src="swipe-row-actions/swipe.js" defer></script>

<ul>
  <li class="swipe">
    <div class="swipe-face">
      <p>Rider on the way</p>
      <button class="swipe-more" type="button" aria-expanded="false" aria-controls="a1" aria-label="Actions for Rider on the way">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
      </button>
    </div>
    <div class="swipe-actions" id="a1">
      <button class="swipe-archive" type="button">Archive</button>
      <button class="swipe-delete" type="button">Delete</button>
    </div>
  </li>
</ul>
```

```js
list.addEventListener("action", (e) => save(e.target, e.detail.action)); // "archive" or "delete"
row.reset(); // show a hidden row again
```

## How each person gets to the actions

| Input | What it takes |
|---|---|
| Touch, pen, mouse | Drag the row left. A drag up or down still scrolls the list |
| Keyboard | Tab to the dots button, then Enter, Space or Arrow Left. Focus moves to Archive. Escape or Arrow Right shuts it |
| Screen reader | The dots button is a disclosure (`aria-expanded`); the actions are out of the tab order while shut |

After a row goes, focus moves to the next row's dots button, so a keyboard user can clear a list in a row.

## Options

| Property | Does | Default |
|---|---|---|
| `--swipe-open` | Width of the actions when open | `160px` |
| `--swipe-face` | Row background, which must be solid to hide the actions | White |
| `--swipe-archive`, `--swipe-delete` | Action colours | Blue, red |

## Do

- Make the long swipe the safe action (Archive), not Delete.
- Say what happened in a live status line, and offer a way back.

## Do not

- Hide an action that exists only behind a swipe. Keep the dots button.
- Put swipe rows inside something that also swipes sideways, such as a carousel.

## Reduced motion

The row still follows your finger. When you let go it jumps open, shut or away, and a removed row disappears without sliding or closing up.
