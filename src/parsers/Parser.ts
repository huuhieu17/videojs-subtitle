import { LoadSubtitleOptions } from "../loader/SubtitleSource";
import { SubtitleTrack } from "../types";


export interface SubtitleParser {

    parse(
        content: string,
        options?: LoadSubtitleOptions
    ): SubtitleTrack;

}