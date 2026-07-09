import { SubtitleCue } from "../types";

export interface SubtitleParser {

    parse(content: string): SubtitleCue[];

}