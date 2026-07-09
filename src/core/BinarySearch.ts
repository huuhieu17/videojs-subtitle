import { SubtitleCue } from "../types";

export function binarySearchCue(

    cues: SubtitleCue[],

    currentTime: number,

    startIndex = 0

): {

    cue: SubtitleCue | null;

    index: number;

} {

    let left = startIndex;

    let right = cues.length - 1;

    while (left <= right) {

        const mid =

            (left + right) >> 1;

        const cue = cues[mid];

        if (

            currentTime < cue.start

        ) {

            right = mid - 1;

        }

        else if (

            currentTime > cue.end

        ) {

            left = mid + 1;

        }

        else {

            return {

                cue,

                index: mid

            };

        }

    }

    return {

        cue: null,

        index: -1

    };

}