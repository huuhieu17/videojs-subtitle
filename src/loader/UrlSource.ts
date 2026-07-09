import { SubtitleTrack } from "../types";
import { parseSubtitle } from "../parsers";
import {
    SubtitleSource,
    LoadSubtitleOptions
} from "./SubtitleSource";

export class UrlSource
implements SubtitleSource<string> {

    async load(
        url: string,
        options?: LoadSubtitleOptions
    ): Promise<SubtitleTrack> {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Load subtitle failed (${response.status})`
            );

        }

        const content =
            await response.text();

        const type =
            options?.type ??
            this.detect(url);

        return {

            id:
                options?.id ??
                crypto.randomUUID(),

            label:
                options?.label ??
                url,

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

    private detect(
        url: string
    ): "srt" | "vtt" {

        return url
            .toLowerCase()
            .endsWith(".vtt")
            ? "vtt"
            : "srt";

    }

}