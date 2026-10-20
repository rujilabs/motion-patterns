# Shatter

The view cracks into shards around an impact point. The shards jolt apart, so the next view shows through the cracks, then fall away under gravity, the ones nearest the impact first, each turning a little as it drops.

[Live demo](https://motion.rujilabs.com/patterns/shatter/) · [style.css](style.css) · [shatter.js](shatter.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shatter/style.css">
<script src="shatter/shatter.js"></script>

<div class="shatter-stack" id="works" data-shatter>
  <figure class="is-current">One</figure>
  <figure>Two</figure>
</div>
<button type="button" data-shatter-go aria-controls="works">Next</button>
```

A click on the stack breaks it from the pointer; the button breaks it from a point just off the middle.

## How it works

`shatter.js` swaps the views at once, then lays a `.shatter-shards` layer over the stack with 30 copies of the old view. Each copy is cut to one shard with `clip-path`: 10 rays from the impact point (with a little jitter), crossed by three rings, so the pieces are small near the impact and large at the edges. Each shard is moved with `element.animate()`: a short jolt away from the impact on `--ease-out`, then a fall on `--ease-in` with a small spin. The whole fall takes 1.3 times `--dur-slow`, with up to 320ms of delay by distance from the impact. The layer is removed when the last shard lands.

| Event or class | What it does |
|---|---|
| `shatterchange` on the stack | Fires with the new index, at the start of the fall |
| `.shatter-shards`, `.shatter-shard` | The temporary layer and its pieces. Copies are `inert` and lose their `id`s |

## Do

- Keep the views light: each shard is a full copy, so a view with video or a heavy canvas costs 30 times as much.
- Save it for a moment that should feel final: clearing a level, discarding a draft, a reveal.

## Do not

- Use it for routine navigation. It is loud, and a reader who goes back and forth will tire of it fast.
- Shatter a view with live controls the reader may be using: the copies cannot be clicked.

## Reduced motion

`shatter.js` swaps the views at once and makes no shards, and the CSS hides the shard layer, so the next view simply appears.
