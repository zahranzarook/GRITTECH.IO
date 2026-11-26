# GRIT site tools

Everything used to produce demo assets lives here, so every change is versioned with the site.

| Tool | What it does |
| --- | --- |
| `record_demos.py` (+ `record_lib.py`) | Screen-records each demo into a looping MP4 for store cards, product pages and service tiles. |
| `cut_dishes.py` | Cuts top-down dish photos into clean transparent circles (used for Ember & Salt and bite.). |
| `gen-land-dots.mjs` | Regenerates the Atlas globe's land dots (`demo/travel/land.js`). |

## Recording preview videos
1. `npm install`, then `pip install playwright && playwright install chromium` (ffmpeg required).
2. `npm run dev` in one terminal.
3. `python3 tools/record_demos.py` (or name specific ones: `ember atlas bite lib`).
4. Make the poster from a frame: `ffmpeg -ss 0.4 -i public/media/store/<name>.mp4 -frames:v 1 poster.png`, then save as `<name>-1.webp` (1376x774) and `<name>-1-800.webp`.
5. Reference the video from `src/data.js` (`video:` on a product, 5th item on a service `demos` entry).

## Image prompts (for new demos)
Ask for photoreal images, no text/logos. Dishes: exactly overhead, plate centred, transparent or pure #00FF00 background (never white).
Destinations/scenes: 3:4 portrait or 16:9, calm lower third for text.
