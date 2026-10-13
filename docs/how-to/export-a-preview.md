# Export a preview video

Record an entry's demo to `preview.mp4` in its folder. The entry page shows a Video link when the file exists.

Playwright and ffmpeg are not dependencies of the collection, so install them for this task only:

```bash
npm i --no-save playwright
npx playwright install chromium
ffmpeg -version   # must be on PATH
```

Then:

```bash
npm run preview -- templates/paper-diorama-hero 8
```

The second argument is the length in seconds (default 8). The video is 1280 x 720, H.264, no audio.

> [!NOTE]
> Keep previews under about 1 MB. They live in git, and every clone downloads them.
