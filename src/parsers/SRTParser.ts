import { SubtitleCue } from "../types";
import { parseSrtTime } from "../utils/time";
import { SubtitleParser } from "./BaseParser";

export class SRTParser implements SubtitleParser {

    parse(content: string): SubtitleCue[] {

        const cues: SubtitleCue[] = [];

        content = content.replace(/^\uFEFF/, "");

        const blocks = content
            .trim()
            .split(/\r?\n\r?\n/);

        for (const block of blocks) {

            const lines = block
                .split(/\r?\n/)
                .filter(Boolean);

            if (lines.length < 2)
                continue;

            let timeLine = "";

            let textStart = 1;

            if (
                lines[0].includes("-->")
            ) {

                timeLine = lines[0];

                textStart = 1;

            } else {

                timeLine = lines[1];

                textStart = 2;

            }

            const times = timeLine.split("-->");

            if (times.length !== 2)
                continue;

            const start = parseSrtTime(
                times[0].trim()
            );

            const end = parseSrtTime(
                times[1].trim()
            );

            const raw = lines
                .slice(textStart)
                .join("\n");

            cues.push({
                start,
                end,
                text: raw,
                html: raw.replace(/\n/g, "<br>")
            });

        }

        return cues;

    }

}