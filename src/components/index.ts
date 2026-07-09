import videojs from "video.js";
import { SubtitleButton } from "./subtitle/SubtitleButton";
import { SubtitleTrackItem } from "./subtitle/SubtitleTrackItem";


videojs.registerComponent(
    "SubtitleButton",
    SubtitleButton as unknown as any
);

videojs.registerComponent(
    "SubtitleTrackItem",
    SubtitleTrackItem as unknown as any
);

export * from "./subtitle/SubtitleButton";
export * from "./subtitle/SubtitleTrackItem";
export * from "./BaseMenuItem";