import { SubtitleManager } from "../core/SubtitleManager";
import { SubtitleEvents } from "../constants/events";

import { ActiveCue } from "../types";
import { SubtitlePlayerHost } from "../player/SubtitlePlayerHost";

import { SubtitleLayer } from "./SubtitleLayer";
import { SubtitleLine } from "./SubtitleLine";
import { SubtitleLinePool } from "./SubtitleLinePool";
import { SubtitleStyleManager } from "./SubtitleStyle";

export class SubtitleRenderer {

    private readonly player: SubtitlePlayerHost;

    private readonly manager: SubtitleManager;

    private readonly layer: SubtitleLayer;

    private readonly pool =
        new SubtitleLinePool();

    private readonly style =
        new SubtitleStyleManager();

    /**
 * Active subtitle lines
 *
 * key = trackId
 */
    private readonly activeLines = new Map<
        string,
        SubtitleLine
    >();

    /**
     * Cache html
     */
    private lastHash = "";

    constructor(
        player: SubtitlePlayerHost,
        manager: SubtitleManager
    ) {

        this.player = player;

        this.manager = manager;

        this.layer = new SubtitleLayer(
            player.el() as HTMLElement
        );

        this.bindEvents();

        this.applyStyle();

    }

    private acquireLine(
        trackId: string
    ): SubtitleLine {

        let line = this.activeLines.get(trackId);

        if (line) {

            return line;

        }

        line = this.pool.acquire();

        this.activeLines.set(trackId, line);

        return line;

    }

    private releaseLine(
        trackId: string
    ): void {

        const line =
            this.activeLines.get(trackId);

        if (!line) {

            return;

        }

        this.pool.release(line);

        this.activeLines.delete(trackId);

    }

    private releaseUnusedLines(

        cues: ActiveCue[]

    ): void {

        const activeIds =

            new Set(

                cues.map(

                    item => item.trackId

                )

            );

        for (

            const id of this.activeLines.keys()

        ) {

            if (

                !activeIds.has(id)

            ) {

                this.releaseLine(id);

            }

        }

    }

    private bindEvents(): void {

        this.manager.events.on(

            SubtitleEvents.CUE_CHANGED,

            (cues: ActiveCue[]) => {

                this.render(cues);

            }

        );

        this.manager.events.on(

            SubtitleEvents.TRACK_ADDED,

            () => {

                this.refresh();

            }

        );

        this.manager.events.on(

            SubtitleEvents.TRACK_ENABLED,

            () => {

                this.refresh();

            }

        );

        this.manager.events.on(

            SubtitleEvents.TRACK_DISABLED,

            () => {

                this.refresh();

            }

        );

        this.manager.events.on(

            SubtitleEvents.TRACK_REMOVED,

            () => {

                this.refresh();

            }

        );

        this.manager.events.on(

            SubtitleEvents.STYLE_CHANGED,

            () => {

                this.applyStyle();

            }

        );

    }

    private applyStyle(): void {

        const style = this.manager.getStyle();

        this.style.applyLayer(
            this.layer.getElement(),
            style
        );

        for (const line of this.activeLines.values()) {

            this.style.applyLine(
                line.getElement(),
                style
            );

        }

    }

    private createHash(

        cues: ActiveCue[]

    ): string {

        return cues

            .map(item =>

                `${item.trackId}:${item.cue.start}:${item.cue.end}:${item.cue.text}`

            )

            .join("|");

    }

    private render(

        cues: ActiveCue[]

    ): void {

        const hash =

            this.createHash(cues);

        if (

            hash === this.lastHash

        ) {

            return;

        }

        this.lastHash = hash;

        this.renderLines(cues);

    }

    private renderLines(
        cues: ActiveCue[]
    ): void {

        this.releaseUnusedLines(cues);

        const fragment =
            document.createDocumentFragment();

        const style =
            this.manager.getStyle();

        for (const item of cues) {

            const line =
                this.acquireLine(item.trackId);

            line.setCue(item.cue);

            this.style.applyLine(
                line.getElement(),
                style
            );

            fragment.appendChild(
                line.getElement()
            );

        }

        this.style.applyLayer(
            this.layer.getElement(),
            style
        );

        this.layer.render(fragment);

    }

    show(): void {

        this.layer.show();

    }

    hide(): void {

        this.layer.hide();

    }

    getElement(): HTMLElement {

        return this.layer.getElement();

    }

    destroy(): void {

        this.manager.events.clear();

        for (const line of this.activeLines.values()) {

            line.destroy();

        }

        this.activeLines.clear();

        this.pool.clear();

        this.layer.destroy();

    }

    refresh(): void {

        this.render(

            this.manager.getCurrentCues(

                this.player.currentTime() || 0

            )

        );

    }
}
