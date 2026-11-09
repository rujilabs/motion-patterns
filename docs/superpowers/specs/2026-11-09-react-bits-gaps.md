# Technique gaps from a public component library (2026-11-09)

## Why

A large public React component library covers techniques this collection does not have yet. Its licence
(MIT with a Commons Clause) forbids redistributing its components "as a ported version", so nothing from it
is ported, copied or credited as a source. Only the generic technique names (a dock, a scroll card stack, a
slide-to-pay control) were listed. Every entry below is built from scratch, without reading that source, and
ships as `relation: original`.

## Scope

About 92 entries over six releases:

| Release | Tier | Entries | Tech |
|---|---|---|---|
| v0.6.0 | A | 20 | CSS, SVG, small JS |
| v0.7.0 | B part 1 | about 22 | Canvas 2D and JS |
| v0.9.0 | B part 2 | 20 | DOM, SVG and canvas |
| v0.10.0 to v0.12.0 | C | 27 | WebGL fragment shaders |

WebGL shader backgrounds came later as tier C (27 entries over v0.10.0 to v0.12.0, category `shader`, ADR 0006).

## Rules for every entry

- One real job per entry, never a job already in the catalogue. Fictional Malaysian businesses, specific numbers.
- `style.css` holds only the pattern and stays lean: `motion.css` was at 66.4 of 80 KB gzipped before this work,
  `motion-state.css` at 9.3 of 10 KB. Hands-on controls go in `form`, not `state`.
- Reduced motion, keyboard, touch and the 390 px rules from `docs/how-to/add-an-entry.md`.

## Tier A (v0.6.0)

| Slug | Category | Job |
|---|---|---|
| dock-magnify | emphasis | staff portal app bar: icons grow near the pointer |
| scroll-card-stack | scroll | pricing plans pile up on each other as the page scrolls |
| blur-in-text | type | studio hero line: words sharpen out of a blur one by one |
| scroll-word-reveal | scroll | founder letter: words light up as you read down |
| scroll-speed-marquee | scroll | a marquee that runs faster when the reader scrolls faster |
| focus-word | type | tagline: a focus frame steps word to word, the rest blurred |
| border-orbit | light | featured plan card: a light runs round its border |
| target-brackets | emphasis | four corner brackets snap onto the hovered product |
| image-trail | emphasis | photographer hero: photos drop behind the moving pointer |
| flowing-menu-row | state | menu row floods with a running marquee on hover |
| hold-to-confirm | form | delete a saved card: hold for 1.5 s, ring fills |
| slide-to-pay | form | slide the knob to pay RM 86.40 |
| otp-slots | form | 6-digit TAC input with a caret that moves between slots |
| edge-blur | look | progressive blur where a scrolling list meets the header |
| sticker-peel | emphasis | promo sticker peels back to show the code |
| tear-ticket | panel | tear the stub off a ferry ticket to check in |
| swipe-row-actions | form | swipe an inbox row to reveal Archive and Delete |
| heart-burst | emphasis | save a recipe: heart pops with a ring of dots |
| folder-open | panel | a folder opens and fans out three documents |
| masonry-settle | entry | bakery gallery tiles drop into a masonry grid |

## Tier B part 1 (v0.7.0)

Canvas entries stop drawing when off screen or when the tab is hidden, size to `devicePixelRatio`, draw one
meaningful still frame without JS motion (reduced motion or no script), and loops over 5 s can be paused.

| Slug | Category | Job |
|---|---|---|
| dot-field-push | tile | event hall booking hero: a dot field parts around the pointer |
| magnet-needles | emphasis | land surveyor hero: a grid of needles turns to point at the pointer |
| letter-rain-glitch | loop | maintenance page: a wall of characters flickers behind the notice |
| radar-sweep | loop | ride app "finding a rider near you": a sweep lights nearby dots |
| contour-drift | look | hiking trail page: slow drifting contour lines behind the route |
| swarm-cursor | emphasis | honey shop hero: a small swarm follows the pointer |
| crosshair-guides | emphasis | land plot picker: guide lines and live coordinates follow the pointer |
| pixel-trail | emphasis | retro game cafe hero: the pointer leaves fading square pixels |
| ribbon-cursor | emphasis | batik house hero: soft ribbons trail the pointer |
| grid-cell-glow | tile | co-working floor plan: cells near the pointer light up |
| shape-grid-drift | loop | architecture studio hero: a grid of squares drifts, the hovered cell fills |
| thread-waves | wave | textile mill hero: fine threads wave and bend away from the pointer |
| falling-words | emphasis | a 404 page: the words drop and pile up when clicked |
| echo-text | type | radio station name with trailing echo copies |
| fold-text | type | origami workshop title folds in like paper |
| stroke-fill-text | type | gym class list: outlined names fill on hover |
| warp-text | type | a line of text that bulges toward the pointer |
| depth-text | type | layered extruded headline that tilts with the pointer |
| text-cursor-trail | emphasis | kids storybook page: little icons follow the pointer |
| fuzzy-text | type | an error code that jitters with noise, calmer on hover |
| scroll-float-text | scroll | headline letters float up into place as it scrolls in |
| scroll-expand-media | scroll | resort hero: a framed photo grows to full bleed on scroll |
| electric-border | light | limited drop card: a crackling border |
| cube-grid-tilt | solid | hardware store tile picker: a grid of cubes tilts toward the pointer |

## Tier B part 2 (v0.9.0)

`emphasis` (9.1 KB) and `state` (9.6 KB) are near their 10 KB category cap, so none of these go there.

| Slug | Category | Job |
|---|---|---|
| drag-deck | panel | rental shortlist: flick listing cards off a stack, keep or skip |
| bounce-cards | entry | wedding photographer album: a fan of prints bounces in and spreads on hover |
| orbit-images | curve | laksa recipe: ingredient photos orbit the bowl |
| dome-gallery | globe | museum wall: photos on the inside of a dome you drag around |
| flying-posters | camera | film festival line-up: posters fly toward the viewer on scroll |
| staggered-list | entry | kopitiam order queue: rows stagger in and the selection follows the keys |
| card-nav | morph | co-working site nav: the bar opens into three link cards |
| bubble-menu | morph | florist menu: the button blooms into round link bubbles |
| gooey-nav | morph | swim school tabs: a blob stretches from tab to tab |
| magic-bento | tile | accounting app features: a bento grid whose borders glow near the pointer |
| holo-card | light | gym membership card: holographic foil shifts as it tilts |
| glass-icons | light | smart home tiles: frosted glass icons light up when on |
| shredder | panel | delete a draft invoice: it feeds through a shredder in strips |
| paper-crumple | morph | discard a note: it crumples into a ball and drops in the bin |
| jelly-radio | form | delivery slot picker: the dot wobbles over to the chosen slot |
| peek-rating | form | rate a meal: a face reacts as the stars fill |
| bell-toggle | form | prayer time alerts: the bell rings when switched on |
| flying-button | form | contact form send: the button folds into a paper plane and flies off |
| lanyard-badge | wave | conference pass: a badge on a lanyard you can drag and let swing |
| comet-dial | drum | oven timer: a dial with a comet tail that counts down |

## Tier C (v0.10.0 to v0.12.0)

Raw WebGL 1 fragment shaders, category `shader`, `tech` includes `webgl` (rules in ADR 0006). Built nine at a time,
one agent at a time, released per batch.

| Batch | Slug | Job |
|---|---|---|
| 1 | starfield-drift | planetarium night-show booking hero: a spiral of stars turns and leans toward the pointer |
| 1 | warp-tunnel | overnight express bus booking: light streaks rush past, faster while "Search trips" is held |
| 1 | silk-fold | songket boutique hero: a sheet of silk folds slowly and catches the light |
| 1 | oil-sheen | car detailing ceramic coating page: a thin-film rainbow sheen shifts with the pointer |
| 1 | plasma-field | esports cafe hero: a slow plasma glow in the house colours behind the opening hours |
| 1 | stage-beams | concert ticket page: moving spotlight beams sweep through haze |
| 1 | god-rays | tea estate morning hero: light rays fall through drifting mist from behind the hill |
| 1 | dither-wave | record store hero: a moving gradient drawn in ordered 4 by 4 dither |
| 1 | voice-orb | bank hotline call screen: a glowing orb swells with the caller's voice level |
| 2 | prism-split | optician hero: a beam enters a glass prism and fans out into a spectrum that follows the pointer |
| 2 | storm-bolt | weather alert card: forked lightning flickers inside a storm warning |
| 2 | chrome-pour | metal fabrication workshop hero: liquid chrome flows and reflects a studio light |
| 2 | ripple-grid | koi farm hero: a lit grid ripples out from every tap like a pond |
| 2 | grid-warp | property listing hero photo: the photo bends like a rubber sheet under the pointer |
| 2 | paint-swirl | board game cafe hero: thick paint swirls in a slow domain-warped vortex |
| 2 | halftone-reveal | print shop hero: a photo shows as halftone dots that grow into the full image under the pointer |
| 2 | dither-veil | portrait studio: a dithered veil dissolves to reveal the photo as it scrolls in |
| 2 | laser-line | laser engraving shop: a laser beam traces the customer's name onto wood, sparks and smoke |
| 3 | ink-stir | watercolour class hero: the pointer stirs coloured ink in a real fluid simulation |
| 3 | smoke-ether | day spa hero: soft coloured smoke flows along curl noise and bends around the pointer |
| 3 | molten-metal | goldsmith hero: blobs of molten gold merge and split like a lava lamp |
| 3 | ferrofluid | speaker shop: a ferrofluid puddle spikes up to the beat of the demo track |
| 3 | ball-pit | kids play centre hero: lit balls tumble and get pushed aside by the pointer |
| 3 | metal-badge | hardware store loyalty badge: brushed metal with a light that rolls as it tilts |
| 3 | crystal-ball | jewellery shop hero: a glass sphere refracts the ring display behind it |
| 3 | glass-lens | pharmacy leaflet: a glass lens slides over the small print and magnifies it |
| 3 | elastic-mesh | mattress shop: the fabric mesh dents where you press and springs back |

## After tier C: style-flight (v0.13.0)

Not from the component library: an idea from a social post showing one paper plane flight in ten art styles.
Concept only, built from scratch, generic style names (no people, studios or toy and console brands).

| Slug | Category | Job |
|---|---|---|
| style-flight | scene | animation studio "pick your style" menu: the same paper plane flight previewed in ten looks (pixel, chalkboard, glow sketch, low-poly, comic, flat vector, minimal line, glossy 3D, brick toy, clay figure); hover, focus or tap plays a card, the chosen one opens full size |
