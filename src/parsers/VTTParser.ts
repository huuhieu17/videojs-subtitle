import { SubtitleCue } from "../types";
import { parseVttTime } from "../utils/time";
import { SubtitleParser } from "./BaseParser";

export class VTTParser implements SubtitleParser {

    parse(content: string): SubtitleCue[] {

        const cues: SubtitleCue[] = [];

        content = content
            .replace(/^WEBVTT/, "")
            .trim();

        const blocks = content
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

            } else {

                timeLine = lines[1];

                textStart = 2;

            }

            const [startStr, endStr] =
                timeLine.split("-->");

            if (!endStr)
                continue;

            cues.push({

                start: parseVttTime(startStr.trim()),

                end: parseVttTime(endStr.trim()),

                text: lines
                    .slice(textStart)
                    .join("<br>")

            });

        }

        return cues;

    }

}