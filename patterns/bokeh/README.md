# Bokeh

Soft, out-of-focus light discs behind a sharp subject. On load each light opens from a sharp point into a disc while the background goes soft, then the discs drift slowly.

[Live demo](https://motion.rujilabs.com/patterns/bokeh/) · [style.css](style.css)

## Use

Three layers in one positioned frame: the background picture, the lights, then your subject on top.

```html
<section class="bokeh-group">
  <label class="bokeh-pause"><input type="checkbox"> Pause</label>
  <div class="frame">
    <img class="bokeh-defocus" src="street.png" alt="">
    <div class="bokeh" aria-hidden="true">
      <span class="bokeh-disc warm-1"></span>
      <span class="bokeh-disc cool-1"></span>
    </div>
    <img class="subject" src="cup.png" alt="A cup on the table">
  </div>
</section>
```

```css
.warm-1 { --bx: 20%; --by: 30%; --bs: 80px; }
.cool-1 { --bx: 70%; --by: 25%; --bs: 56px; --bokeh-color: #9cbcf5; --bokeh-delay: .2s; }
```

## Options

| Class or property | What it does |
|---|---|
| `.bokeh` | The layer that holds the discs. Fills its positioned parent |
| `.bokeh-disc` | One light. Opens from a point, then drifts |
| `--bx`, `--by` | Centre of the disc in percent of the layer. Default `50%` |
| `--bs` | Diameter. Default `48px`; container units (`cqw`) keep the look at every size |
| `--bokeh-color` | Light colour. Default a warm `#ffd59a` |
| `--bo` | Strength (opacity). Default `.75` |
| `--bokeh-delay` | When this light opens. Default `0s` |
| `--bdx`, `--bdy`, `--bokeh-dur` | Drift distance and time for one way. Defaults `10px`, `-8px`, `14s` |
| `.bokeh-defocus` | On the background picture: blurs it to `--bokeh-blur` (default `6px`) as the lights open |
| `.bokeh-pause` inside `.bokeh-group` | A checkbox that stops the drift |

## Do

- Keep two or three colours at most, close to the real light in the scene: warm street lamps and one cool tone.
- Vary the sizes. Discs nearer the lens are bigger; a row of equal circles reads as a pattern, not a lens.

## Do not

- Put discs in front of the subject or over text. They belong behind the plane of focus.
- Make the drift fast. Out-of-focus lights barely move; anything quicker looks like snow.

## Reduced motion

The discs show fully open and stay still, the background is already soft, and the pause toggle hides.
