# Flying button

Use when: someone sends a message through a contact or enquiry form and should see it leave.

A submit button whose paper folds into a paper plane and flies away. On a valid submit the label lifts away, the button's colour block gathers in a little, then its outline folds from a rectangle into the side view of a plane while the wing fold darkens. It dips back a touch, the way a hand draws back before a throw, then it flies up and to the right, shrinking and fading. About a second later the button comes back with a spring as a green Sent with a tick, and it stays Sent until the form is edited again, so a double click never sends twice.

[Live demo](https://motion.rujilabs.com/patterns/flying-button/) · [style.css](style.css) · [flying-button.js](flying-button.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="flying-button/style.css">
<script src="flying-button/flying-button.js" defer></script>

<form action="/enquiry" method="post">
  <!-- fields -->
  <button class="fly-btn" type="submit">
    <span class="fly-paper" aria-hidden="true"></span>
    <span class="fly-label">Send enquiry</span>
    <span class="fly-done" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4.5 10.5 8.5 14.5 15.5 6"/></svg>Sent</span>
  </button>
  <p role="status"></p>
</form>
<script>
  form.addEventListener("fly", function () { fetch(form.action, { method: "post", body: new FormData(form) }); });
</script>
```

The browser checks `required` and the other rules first; the plane only flies for a form that would really submit. The script cancels the native submit and fires a `fly` event on the form: post the data from there and say the result in a status line, because the Sent label is hidden from screen readers. Without the script the form submits the normal way.

## Options

Set these on `.fly-btn`.

| Property | Does | Default |
|---|---|---|
| `--fly-paper` | Button colour, and the plane | `#c2521b` |
| `--fly-sent` | Button colour once sent | `#1f7a52` |
| `--fly-text` | Label colour | `#fff` |

In `flying-button.js`, `PLANE` is the plane's outline as six points of the button box. Change it for a different plane, keeping six points so it can morph.

## Do

- Show the result in words next to the button ("Thanks Aina, sent at 10:42 am").
- Keep the button wide enough for its label, about 160 px or more, so the plane has a body.

## Do not

- Play it before the server has the message if sending often fails. Wait for the reply in the `fly` handler and, on an error, say so plainly.
- Use it on every button of a form. It is for the one send.

## Reduced motion

The button turns straight into Sent. No fold, no flight, no spring.

## See also

[`hold-to-confirm`](../hold-to-confirm/), a button you hold down to confirm.
