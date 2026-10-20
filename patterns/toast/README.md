# Toast

Short notices in a corner. Each one slides in from the screen edge while its slot opens from zero height, so the older ones move up to make room instead of jumping. A thin line along the bottom runs down its time; when the line ends, the toast slides out and its slot closes. Hover or focus anywhere on the stack pauses every line, so nothing leaves while it is being read.

[Live demo](https://motion.rujilabs.com/patterns/toast/) · [style.css](style.css) · [toast.js](toast.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="toast/style.css">
<script src="toast/toast.js" defer></script>

<ol class="toast-region" aria-live="polite" aria-label="Notifications"></ol>

<button type="button" data-toast-title="Invoice sent" data-toast-body="On its way to Kedai Ruang.">Send</button>
```

Or from your own code: `toast({ title: "Invoice sent", body: "On its way.", tone: "ok" })`. Put the region in the page from the start: a live region added later is often not read out. Style the card yourself; the bar takes `currentColor`.

## Options

| Class or property | What it does |
|---|---|
| `.toast-region` | The corner stack, bottom right. Newest at the bottom |
| `--toast-life` | Time each toast stays. Default `5s` |
| `--toast-w` / `--toast-inset` | Stack width (`340px`) and distance from the corner (`16px`) |
| `--toast-gap` | Space between toasts. Default `8px` |
| `.toast-bar` | The time line. It is also the timer: pause it and the toast stays |
| `tone` / `data-toast-tone` | Sets `data-tone` on the card, for your own colours |
| Max in stack | 3 in `toast.js`; a fourth sends the oldest away |

## Do

- Use toasts for news that needs no answer: saved, sent, copied.
- Keep the stack small. Three at once is already a lot to read in five seconds.

## Do not

- Put the only copy of an error, or a choice that must be made, in a toast. It leaves on its own.
- Shorten the time to fit more. Five seconds for a title and a line is already brisk.

## Reduced motion

Toasts appear and leave in place, with no slide and no slot growth. The time line is hidden but still keeps time, so hover and focus still hold a toast open.
