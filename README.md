# videojs-subtitle

Advanced subtitle plugin for [Video.js](https://videojs.com/) with SRT/VTT loading, custom rendering, track switching, and an in-player subtitle style editor.

## Features

- Load subtitles from URL, File, or raw string.
- Supports `.srt` and `.vtt`.
- Custom subtitle overlay renderer.
- Video.js control-bar CC menu.
- Track enable, disable, switch, remove, and clear APIs.
- In-player style editor with color picker, font selector, font size, position, background, opacity, and drag-to-position.
- TypeScript types included.

## Install

```bash
npm install videojs-subtitle
```

or:

```bash
yarn add videojs-subtitle
```

## Usage

Import Video.js, Video.js styles, and the plugin:

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

HTML:

```html
<video
  id="player"
  class="video-js vjs-default-skin"
  controls
  preload="auto"
  width="900"
>
  <source src="/video.mp4" type="video/mp4" />
</video>
```

## Style Editor

Open the Video.js CC menu and choose `Style...`.

The editor supports:

- Text color
- Font family, including custom font names
- Font size
- Top, center, and bottom positioning
- Background color
- Transparent background
- Opacity
- Dragging the subtitle overlay to adjust vertical position

Custom font names work when the page has already loaded the font through CSS, for example from a local stylesheet or a web font provider.

## API

### `player.subtitlePlus(options?)`

Creates or returns the plugin instance for a Video.js player.

```ts
const subtitles = player.subtitlePlus({
  style: {
    fontSize: 30,
    color: "#ffffff"
  }
});
```

### `loadFromUrl(url, options?)`

Loads a subtitle file from a URL and adds it as a track.

```ts
await subtitles.loadFromUrl("/subs/en.srt", {
  id: "en",
  label: "English",
  language: "en",
  type: "srt"
});
```

### `loadFromFile(file, options?)`

Loads a subtitle from a browser `File`.

```ts
await subtitles.loadFromFile(file, {
  id: "local",
  label: file.name
});
```

### `loadFromString(content, options?)`

Loads subtitles from a raw string.

```ts
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

## Development

```bash
npm install
npm run dev
npm run build
```

The demo runs with Vite at:

```text
http://127.0.0.1:3000/
```

## Publishing

Before publishing:

1. Update `version` in `package.json`.
2. Run `npm run build`.
3. Confirm `dist/` contains the JS, CSS, and type declarations.
4. Run `npm publish`.

`prepublishOnly` also runs the build automatically before publishing.

## License

MIT
