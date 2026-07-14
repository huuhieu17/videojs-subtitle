# videojs-subtitle

Advanced custom subtitle renderer for `@videojs/html`, Video.js 8, and HTML media players.

This package focuses on custom subtitle rendering instead of native browser text tracks. It supports SRT/VTT loading, track switching, an in-player CC menu, and a visual style editor with color picker, font selector, font size, background, opacity, and drag-to-position.

## Support Matrix

| Player target | Import path | Status |
| --- | --- | --- |
| `@videojs/html` / Video.js 10 beta | `videojs-subtitle/html` | Supported |
| Video.js 8 classic | `videojs-subtitle` | Supported |
| Vanilla HTML `<video>` | `videojs-subtitle/html` | Supported through the HTML adapter |
| React / Vue wrappers | `videojs-subtitle/html` | Planned docs and helpers |

## Features

- Load subtitles from URL, browser `File`, or raw string.
- Supports `.srt` and `.vtt`.
- Custom overlay renderer.
- CC menu for track switching, import, hide/show, and style editor.
- Style editor with color picker, font family, font size, position, background, opacity, and drag-to-position.
- Shared API for v10 HTML adapter and Video.js 8 plugin.
- TypeScript declarations included.

## Install

```bash
npm install videojs-subtitle
```

```bash
yarn add videojs-subtitle
```

Import the stylesheet once:

```ts
import "videojs-subtitle/style.css";
```

## Quick Start: `@videojs/html` / Video.js 10 Beta

Use the HTML adapter. Video.js 10 beta does not use the classic Video.js 8 `registerPlugin` / `registerComponent` API.

```ts
import { createHtmlSubtitle } from "videojs-subtitle/html";
import "videojs-subtitle/style.css";

const container = document.querySelector("media-container") as HTMLElement;
const video = container.querySelector("video") as HTMLVideoElement;
const controlBar = container.querySelector("media-controls") as HTMLElement;

const subtitles = createHtmlSubtitle(container, {
  container,
  video,
  controlBar,
  style: {
    color: "#ffffff",
    fontSize: 28,
    fontFamily: "Arial",
    background: "rgba(0, 0, 0, 0.55)",
    position: "bottom",
    bottom: 76
  }
});

await subtitles.loadFromUrl("/subtitles/movie.srt", {
  id: "en",
  label: "English",
  language: "en",
  type: "srt"
});

subtitles.switch("en");
```

Example `@videojs/html` markup:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@videojs/html/cdn/video-ui.js"></script>

<video-player>
  <media-container class="media-default-skin media-default-skin--video">
    <video src="/movie.mp4" playsinline></video>

    <media-controls class="media-surface media-controls">
      <!-- your @videojs/html controls -->
    </media-controls>
  </media-container>
</video-player>
```

### HTML Adapter Options

```ts
createHtmlSubtitle(container, {
  container: "media-container",
  video: "video",
  controlBar: "media-controls",
  button: true,
  buttonPlacement: "control-bar",
  style: {
    fontSize: 28
  }
});
```

- `container`: element or selector where the subtitle overlay is mounted. For `@videojs/html`, `media-container` is usually the best target.
- `video`: native `video` or `audio` element used for `timeupdate` and `currentTime`.
- `controlBar`: element or selector where the CC button is inserted. For the CDN HTML skin, this is usually `media-controls`.
- `button`: set to `false` if you want to use your own button.
- `buttonPlacement`: where the CC button starts. Supported values are `"control-bar"`, `"top-left"`, `"top-right"`, `"bottom-left"`, and `"bottom-right"`. If `"control-bar"` is requested but no `controlBar` exists, it falls back to `"top-right"`.
- `buttonPosition`: alias for the older fallback-only position option.
- `style`: initial subtitle style.

If no matching `controlBar` is found, the adapter creates a fallback CC control inside the subtitle container.

Users can also move the CC button from the CC menu under `CC button`.

```ts
subtitles.setButtonPlacement("top-right");
subtitles.setButtonPlacement("control-bar");
```

### Vanilla HTML Video

The same HTML adapter can be used without `@videojs/html`:

```html
<div class="player-shell">
  <video id="movie" src="/movie.mp4" controls></video>
</div>
```

```ts
import { createHtmlSubtitle } from "videojs-subtitle/html";
import "videojs-subtitle/style.css";

const shell = document.querySelector(".player-shell") as HTMLElement;
const video = document.querySelector("#movie") as HTMLVideoElement;

const subtitles = createHtmlSubtitle(video, {
  container: shell,
  video
});

await subtitles.loadFromString(srtText, {
  id: "inline",
  label: "Inline SRT",
  type: "srt"
});

subtitles.switch("inline");
```

## Video.js 8 Classic

Use the root package import for Video.js 8.

```ts
import videojs from "video.js";
import "video.js/dist/video-js.css";

import "videojs-subtitle";
import "videojs-subtitle/style.css";

const player = videojs("player");

const subtitles = player.subtitlePlus({
  style: {
    color: "#ffffff",
    fontSize: 28,
    fontFamily: "Arial",
    background: "transparent",
    position: "bottom",
    bottom: 40
  }
});

await subtitles.loadFromUrl("/subtitles/movie.srt", {
  id: "en",
  label: "English",
  language: "en",
  type: "srt"
});

subtitles.switch("en");
```

```html
<video
  id="player"
  class="video-js vjs-default-skin"
  controls
  preload="auto"
  width="900"
>
  <source src="/movie.mp4" type="video/mp4" />
</video>
```

For classic browser scripts, load the UMD build:

```html
<link rel="stylesheet" href="./dist/videojs-subtitle.css" />
<script src="https://vjs.zencdn.net/8/video.min.js"></script>
<script src="./dist/videojs-subtitle.umd.cjs"></script>
```

## Shared API

Both `createHtmlSubtitle(...)` and `player.subtitlePlus(...)` return a subtitle instance with the same core methods.

### Load Subtitles

```ts
await subtitles.loadFromUrl("/subs/en.srt", {
  id: "en",
  label: "English",
  language: "en",
  type: "srt"
});

await subtitles.loadFromFile(file, {
  id: "local",
  label: file.name
});

await subtitles.loadFromString(srtText, {
  id: "inline",
  label: "Inline SRT",
  type: "srt"
});
```

### Track Methods

```ts
subtitles.addTrack(track);
subtitles.addTracks([trackA, trackB]);
subtitles.enable("en");
subtitles.disable("en");
subtitles.toggle("en");
subtitles.switch("en");
subtitles.removeTrack("en");
subtitles.clearTracks();
```

### Visibility

```ts
subtitles.hideSubtitles();
subtitles.showSubtitles();
subtitles.toggleSubtitleVisibility();
```

### Style

```ts
subtitles.setStyle({
  color: "#ffd54a",
  fontSize: 32,
  fontFamily: "Inter",
  background: "rgba(0, 0, 0, 0.65)",
  opacity: 1,
  position: "bottom",
  bottom: 56
});

const style = subtitles.getStyle();
subtitles.openStyleEditor();
```

Custom font names work when the page has already loaded the font through CSS.

## Types

```ts
interface SubtitleTrack {
  id: string;
  label: string;
  language?: string;
  type: string;
  cues: SubtitleCue[];
}

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
  html?: string;
}
```

## Framework Roadmap

The current package is framework-agnostic. React and Vue can already use the HTML adapter by creating the subtitle instance after the player DOM is mounted.

Planned docs/helpers:

- `useSubtitlePlus` example for React.
- Vue composable example.
- Vanilla JS no-build CDN example.
- Dedicated framework wrapper packages only if the core API becomes too noisy for framework users.

## Local Demo

```bash
npm install
npm run build
npm run dev:demo
```

Open:

```text
http://127.0.0.1:3000/demo/index.html
```

The current demo targets `@videojs/html` / Video.js 10 beta. It loads `../dist/html.js`, injects a CC button into `media-controls`, loads an inline SRT track, and exposes the instance as:

```js
window.videojsSubtitleHtmlDemo
```

## Publishing

Package metadata:

```json
{
  "name": "videojs-subtitle",
  "publishConfig": {
    "access": "public"
  }
}
```

Before publishing:

```bash
npm run build
npm pack --dry-run
npm publish --access public
```

If you publish for the first time, make sure you are logged in:

```bash
npm login
npm whoami
```

## License

MIT
