import { SubtitleTrack } from "../types";
import { parseSubtitle } from "../parsers";
import {
    SubtitleSource,
    LoadSubtitleOptions
} from "./SubtitleSource";

export class StringSource
implements SubtitleSource<string> {

    async load(
        content: string,
        options?: LoadSubtitleOptions
    ): Promise<SubtitleTrack> {

        const type =
            options?.type ??
            (
                content.startsWith("WEBVTT")
                    ? "vtt"
                    : "srt"
            );

        return {

            id:
                options?.id ??
                crypto.randomUUID(),

            label:
                options?.label ??
                "Subtitle",

            language:
                options?.language,

            type,

            cues:
                parseSubtitle(
                    content,
                    type
                )

        };

    }

}