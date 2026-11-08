# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). This file is generated from commit
messages by `npm run changelog`; do not edit it by hand.

## [0.8.0] - 2026-11-08

### Added

- **site:** Poster grid with search, filters in the URL, new-release row and related entries


## [0.7.0] - 2026-11-08

### Added

- **text-cursor-trail:** Storybook icons follow the pointer in a line
- **fuzzy-text:** An error code jitters, calmer on hover
- **scroll-float-text:** Headline letters float into place on scroll
- **scroll-expand-media:** A framed photo grows to full bleed on scroll
- **electric-border:** A crackling border on a limited drop card
- **cube-grid-tilt:** Tile cubes tilt toward the pointer and flip for price
- **echo-text:** A station name rings out in echo copies
- **fold-text:** Title letters fold open like origami paper
- **stroke-fill-text:** Outlined class names fill with ink on hover
- **warp-text:** Letters swell toward the pointer
- **depth-text:** A layered 3D headline tilts with the pointer
- **dot-field-push:** A dot field parts around the pointer
- **magnet-needles:** A grid of needles turns to point at the pointer
- **letter-rain-glitch:** A calm character wall behind a maintenance notice
- **radar-sweep:** A sweep finds nearby riders, then locks on one
- **contour-drift:** Contour lines drift behind a trail card
- **swarm-cursor:** A small swarm follows the pointer and rests at the jar
- **falling-words:** A 404 page whose words drop and pile up
- **crosshair-guides:** Guide lines and live coordinates over a lot plan
- **pixel-trail:** The pointer leaves fading square pixels
- **ribbon-cursor:** Ribbons trail the pointer and hang from a hook
- **grid-cell-glow:** Hot desk cells light up near the pointer
- **shape-grid-drift:** A drafting grid drifts, the hovered cell fills
- **thread-waves:** Threads ripple and part around the pointer

### Fixed

- **edge-blur:** Restore the house-style demo hint
- Demo weekdays match the 2026 calendar


## [0.6.0] - 2026-11-08

### Added

- **dock-magnify:** App bar icons swell by distance to the pointer
- **target-brackets:** Corner brackets glide to frame the hovered card
- **image-trail:** Photos drop behind the moving pointer
- **heart-burst:** Save button pops with a ring of dots
- **sticker-peel:** Promo sticker peels back to show a code
- **scroll-card-stack:** Plan cards pile up as the page scrolls
- **scroll-word-reveal:** A letter inks in word by word on scroll
- **scroll-speed-marquee:** Marquee speed follows the scroll
- **edge-blur:** Progressive blur where a list meets a sticky bar
- **masonry-settle:** Gallery tiles drop into a masonry grid
- **hold-to-confirm:** Press and hold to remove a saved card
- **slide-to-pay:** Slide the knob to pay a bill
- **otp-slots:** Six-slot TAC input with a moving caret
- **swipe-row-actions:** Swipe an inbox row to archive or delete
- **blur-in-text:** Hero words sharpen out of a blur one by one
- **focus-word:** A focus frame steps word to word
- **border-orbit:** Light runs round a featured card's border
- **flowing-menu-row:** Menu row floods with a marquee from the entry edge
- **folder-open:** A client folder opens and fans out three papers
- **tear-ticket:** Tear the stub off a ferry ticket to check in


## [0.5.0] - 2026-11-07

### Added

- **cells-to-bars:** Cells rise from a table into solid 3D bars
- **frame-break:** A panel lifts out of a flat screen in 3D
- **ui-world:** Panels at depth with a drifting camera
- **glass-caption:** Readable caption on frosted glass
- **match-checklist:** Rows tick in order, then the result
- **headline-floor:** Titles scroll across a tilted floor
- **pull-back-reveal:** From one item back to the whole shelf
- **carousel-focus:** 3D ring zooms each panel to read
- **cover-stack:** Covers land in a growing stack


## [0.4.1] - 2026-10-29

### Fixed

- **site:** Entry pages no longer scroll sideways on phones (#3)
- **site:** Long titles fit a phone; site CSS and JS links carry a content hash so deploys reach cached browsers (#4)


## [0.4.0] - 2026-10-29

### Added

- **patterns:** Add scroll-weight, heavy parts trail the scroll on a damped spring (#1)
- V0.4.0, 12 object categories and 60 new patterns (#2)


## [0.3.0] - 2026-10-20

### Added

- **site:** Live timelines under every demo, entry pages, curve plots
- **patterns:** New demo for every pattern, pulse dot thump
- **templates:** Rework paper diorama, squeeze headline and stamp collage
- **split-flap-board:** Add ferry departures board template
- **patterns:** Add chart and state patterns
- **site:** Transition, camera and look categories
- **patterns:** Add entrance, polish and transition patterns
- **patterns:** Add camera move and shot style patterns
- **patterns:** Add choosing and switching control patterns
- **patterns:** Add film cut and wipe transition patterns
- **patterns:** Add overlay patterns: modal, drawer, sheet, menus, toast
- **patterns:** Add hover and click interaction patterns
- **patterns:** Add loading, page transition and ambient patterns
- **patterns:** Add photo lighting looks
- **patterns:** Add navigation, status and scroll patterns
- **patterns:** Add tone and finishing looks
- **patterns:** Add lens and camera looks
- **patterns:** Add animation principle patterns
- **patterns:** Add text and shape patterns
- **patterns:** Add 3D, paper and break-apart transitions
- **site:** One motion-<category>.css per category, filters in category order

### Fixed

- **site:** Scale tall pattern demos to fit their stage
- **cube:** Keep the faces off the caption in a short frame; fix(line-boil): side by side in a short frame

### Performance

- **split-flap-board:** Build the moving flaps only while a cell turns
- **paper-diorama-hero:** Promote layers only while the pointer moves them
- **site:** Smooth scrolling on the gallery
- **site:** Unload gallery demos far off screen


## [0.2.0] - 2026-10-13

### Added

- **rise:** In-view and soft variants, early opacity, capped stagger, entry readme
- **fade:** Frame without flash or layout shift, settle and in-view variants, entry readme
- **draw:** Stroke sequence, text and hover underlines, no cap dot before start, entry readme
- **pop:** Damped spring easing, early opacity, in-view, corner origin and button press, entry readme
- **stamp:** Impact timing with squash and settle, ink seal variant, in-view, entry readme
- **marquee:** Pause toggle, edge fades, reverse rows and speed setting, readable reduced-motion fallback, entry readme
- **pulse:** Beat-and-rest halo sized in em, sonar and counted variants, still halo under reduced motion, entry readme
- **drift:** Three-cycle float that composes with transforms, phase and size controls, entry readme
- **crossfade:** 2 to 4 frames, slow zoom option, pause toggle, all captions readable, entry readme
- **reveal:** Eased scroll rise, clip, parallax and progress bar, timed fallback via play.js, entry readme
- **paper:** Pop-up fold for upright pieces, fading back card, after-build slot and quick pace, entry readme
- **stretch-squeeze:** Hover without layout shift, light-to-heavy variant, font preload, entry readme
- **paper-diorama-hero:** Stacked layout on phones, pop-up house and trees, birds and tag after the build, readme
- **squeeze-headline:** Sequenced entry after the headline settles, button press and arrow, band pause toggle, readme
- **stamp-collage:** Sold out ink seal, spring lift on hover, decoration behind the cards, price labels for screen readers, readme

### Fixed

- **gallery:** Show a credit line only on credited entries


## [0.1.0] - 2026-10-13

### Added

- Motion patterns collection with 12 patterns, 3 templates and gallery

### Fixed

- Review findings across the gate, patterns, templates and gallery


