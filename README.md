# Quad tuning, one step at a time

A step-by-step guide to tuning a quadcopter in Betaflight, from first backup to finished tune.

**Live site:** https://alernkn247.github.io/quad-tuning-guide/

> **Beta.** This guide is still being tested and may contain mistakes. Check each change against your own quad, and keep the backup from step 2.

## What it does

- Walks through 26 steps in four phases: get ready, hover and filters, P and D, finish.
- Adjusts tips and numbers to your quad size, from whoops to 7 inch.
- Shows an animated practice copy of the Betaflight screen on every step that happens in Betaflight, so you can see where to click before touching the real thing.
- Shows example PIDtoolbox graphs for the steps where you read a log.
- Remembers your quad size and the step you were on.
- Installs as an app and works offline, so you can use it at the field.

The practice screens are simplified and their starting values are examples. Nothing in the guide connects to or changes your quad.

## Install it as an app

Open the live site, then:

- **Desktop Chrome or Edge:** click the install icon in the address bar.
- **Android:** open the browser menu and choose "Install app".
- **iPhone or iPad:** tap Share, then "Add to Home Screen".

Open it once while online. After that it loads without a connection.

## Run it locally

There is no build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, but offline support and installing need a server.

## Files

| File | What's in it |
|---|---|
| `index.html` | Page skeleton and the beta banner |
| `styles.css` | All styling, light and dark |
| `steps.js` | The guide's content: every step's text, tips and options |
| `scenes.js` | The simpler Betaflight practice screens (CLI, CPU load, Motors, Blackbox, rates) |
| `app.js` | Rendering, navigation, and the filter, Presets, I Term Relax, PID slider and PIDtoolbox screens |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest`, `icons/` | App name, colours and icons for installing |

## Editing the guide

**Change wording.** Edit `steps.js`. Each step is one object with a `title`, `lead`, `todo` list, and optional `good`, `warn`, `stuck` and per-size `size` notes.

**Add a practice screen to a step.** Add a scene to `SCENES` in `scenes.js`, then set `scene: "<name>"` on the step in `steps.js`. A scene returns:

- `note`: the line shown above the screen
- `html`: the screen's markup, with `data-f="<name>"` on each element the cursor should visit
- `steps`: the targets and instructions, in order
- `render(i, ctx)`: draws the screen as it looks at step `i`, using `ctx.later()` for timed changes

The shared `guidedMock` helper in `app.js` handles the cursor and the Previous, Show next and Play all buttons.

**Add a new file.** Also add it to the `FILES` list in `sw.js`, or it won't be available offline.

## Publishing

The site is served by GitHub Pages from the `main` branch. Pushing to `main` publishes it, usually within a minute. Installed copies fetch the new version the next time they are opened online.
