import { SubtitleCue } from "../types";
import { SRTParser } from "./SRTParser";
import { VTTParser } from "./VTTParser";

export function parseSubtitle(
    content: string,
    type?: string
): SubtitleCue[] {

    if (!type) {

        if (
            content.startsWith("WEBVTT")
        ) {

            type = "vtt";

        } else {

            type = "srt";

        }

    }

    switch (type.toLowerCase()) {

        case "vtt":

            return new VTTParser().parse(
                content
            );

        case "srt":

        default:

            return new SRTParser().parse(
                content
            );

    }

}

