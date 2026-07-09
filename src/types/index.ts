export interface SubtitleCue {

    start: number;

    end: number;

    text: string;

    html?: string;

}

export interface SubtitleTrack {
    id: string;
    label: string;
    language?: string;
    type: string;
    cues: SubtitleCue[];
}

export interface SubtitleStyle {

    color?: string;

    fontSize?: number;

    fontFamily?: string;

    fontWeight?: string | number;

    fontStyle?: "normal" | "italic";

    background?: string;

    opacity?: number;

    textShadow?: string;

    textStroke?: string;

    lineHeight?: number;

    letterSpacing?: number;

    padding?: string;

    borderRadius?: number;

    maxWidth?: string;

    textAlign?: "left" | "center" | "right";

    position?: "top" | "center" | "bottom";

    top?: number;

    bottom?: number;

}

export interface ActiveCue {

    trackId: string;

    cue: SubtitleCue;

}

export interface TrackCache {

    /**
     * Last cue index
     */
    index: number;

    /**
     * Last cue
     */
    cue?: SubtitleCue;

}