import { SubtitleTrack } from "../types";
import { parseSubtitle } from "../parsers";
import {
    SubtitleSource,
    LoadSubtitleOptions
} from "./SubtitleSource";

export class FileSource
implements SubtitleSource<File> {

    async load(
        file: File,
        options?: LoadSubtitleOptions
    ): Promise<SubtitleTrack> {

        const content =
            await file.text();

        const type =
            options?.type ??
            this.detect(file.name);

        return {

            id:
                options?.id ??
                crypto.randomUUID(),

            label:
                options?.label ??
                file.name,

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
        name: string
    ): "srt" | "vtt" {

        return name
            .toLowerCase()
            .endsWith(".vtt")
            ? "vtt"
            : "srt";

    }

}