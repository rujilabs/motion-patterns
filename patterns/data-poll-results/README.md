# Live poll results

Use when: a room votes while someone talks and everyone watches the answer form, as in the Q&A of a conference session or a live stream.

Each option is a real radio button. Pick one and your vote counts at once; pick another and it moves. Votes from everyone else arrive in bursts, and every bar eases to its new share of the total together, so a lead that grows or slips reads as one movement. A small "+3" rises beside each option that gained and fades away. The leading option takes the strong colour. The percentages are rounded by largest remainder, so they always add up to exactly 100, never 99 or 101.

[Live demo](https://motion.rujilabs.com/patterns/data-poll-results/) · [style.css](style.css) · [data-poll-results.js](data-poll-results.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="data-poll-results/style.css">
<script src="data-poll-results/data-poll-results.js" defer></script>

<form class="poll" id="poll" data-unit="votes">
  <h2 id="q">Which payment do most of your customers pick at checkout?</h2>
  <label class="pl-opt" data-votes="26">
    <input type="radio" name="pay" value="qr">
    <span class="pl-name">QR pay</span>
    <span class="pl-pct">38%</span>
    <span class="pl-votes">26 votes</span>
    <span class="pl-bar" aria-hidden="true"></span>
  </label>
  <!-- one label per option -->
</form>
```

```js
var poll = PollResults(document.getElementById("poll"));
socket.onmessage = function (e) { poll.set(e.data.counts); };  // everyone's votes, every update
form.addEventListener("poll:change", function (e) { total.textContent = e.detail.total; });
```

Send the reader's own vote to your server from the form's `change` event. `PollResults.percents(counts)` gives you the same rounding for anything else you print.

## Options

| Attribute, method or property | Does | Default |
|---|---|---|
| `data-votes` | The option's starting count | `0` |
| `data-unit` | The word after each count | `votes` |
| `poll.set(counts)` | All counts at once. Options that gained get a `+n` | |
| `poll.add(index, n)` | Add votes to one option | |
| `poll.clear()` | Forget the reader's vote, for a new round | |
| `poll:change` event | `detail`: counts, percents, total and the reader's pick | |
| `--pl-c`, `--pl-rest`, `--pl-ring` | Accent, empty row, radio ring | crimson, light grey |
| `.is-lead`, `.is-mine` | Classes set on the leading option and the reader's pick | |

## Do

- Batch the votes and call `set()` a few times a second at most. Each ease takes about a second.
- Say in words who leads after a vote and when the poll closes, as the demo does in a polite live region.

## Do not

- Announce every burst to screen readers. Only the reader's own vote and the close are worth saying.
- Round each share on its own. Three options at a third each would show 33, 33 and 33.

## Reduced motion

The bars jump to their new share and no `+n` rises. The demo also holds the votes still until you turn Live votes on.

## See also

[`bars`](../bars/) for a fixed set of numbers, [`data-funnel`](../data-funnel/).
