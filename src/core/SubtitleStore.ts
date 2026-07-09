import {
    ActiveCue,
    SubtitleStyle,
    SubtitleTrack,
    TrackCache
} from "../types";

export class SubtitleStore {

    /**
     * All subtitle tracks
     */
    tracks = new Map<string, SubtitleTrack>();

    /**
     * Cue cache
     */
    trackCaches = new Map<
        string,
        TrackCache
    >();

    /**
     * Enabled tracks
     */
    enabledTracks = new Set<string>();

    /**
     * Cache current cue
     */
    activeCues = new Map<string, ActiveCue>();

    /**
     * Subtitle style
     */
    style: SubtitleStyle = {

        color: "#FFFFFF",

        fontSize: 28,

        fontFamily: "Arial",

        fontWeight: 600,

        background: "transparent",

        opacity: 1,

        lineHeight: 1.4,

        letterSpacing: 0,

        borderRadius: 6,

        padding: "4px 12px",

        textShadow:
            "2px 2px 4px rgba(0,0,0,.8)",

        position: "bottom",

        bottom: 40

    };

    /**
    * cache current time
    */
    currentTime = -1;
}   