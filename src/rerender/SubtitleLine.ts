import { SubtitleCue } from "../types";

export class SubtitleLine {

    private readonly element: HTMLDivElement;

    constructor() {

        this.element = document.createElement("div");

        this.element.className =
            "vjs-subtitle-line";

    }

    getElement(): HTMLDivElement {

        return this.element;

    }

    setCue(
        cue: SubtitleCue
    ): void {

        if (cue.html) {

            this.element.innerHTML =
                cue.html;

            return;

        }

        this.element.textContent =
            cue.text;

    }

    clear(): void {

        this.element.textContent = "";

    }

    destroy(): void {

        this.element.remove();

    }

}