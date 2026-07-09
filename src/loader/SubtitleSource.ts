import { SubtitleTrack } from "../types";

export interface LoadSubtitleOptions {

    id?: string;

    label?: string;

    language?: string;

    type?: "srt" | "vtt";

}

export interface SubtitleSource<T> {

    load(
        source: T,
        options?: LoadSubtitleOptions
    ): Promise<SubtitleTrack>;

}