

import { SubtitleManager } from "../core/SubtitleManager";

import {
    SubtitleStyle,
    SubtitleTrack
} from "../types";
import { SubtitleRenderer } from "../rerender/SubtitleRerender";
import { SubtitleLoader } from "../loader/SubtitleLoader";
import { SubtitleStyleEditor } from "../components/style";
import Player from "video.js/dist/types/player";

export interface SubtitlePluginOptions {

    style?: SubtitleStyle;

}

export class VideojsSubtitlePlugin {

    private readonly player: Player;

    private readonly manager: SubtitleManager;

    private readonly renderer: SubtitleRenderer;

    private readonly loader = new SubtitleLoader();

    private hiddenTrackIds: string[] = [];

    private styleEditor?: SubtitleStyleEditor;

    constructor(
        player: Player,
        options?: SubtitlePluginOptions
    ) {

        this.player = player;

        this.manager = new SubtitleManager();

        this.renderer =
            new SubtitleRenderer(
                player,
                this.manager
            );

        if (options?.style) {

            this.manager.setStyle(
                options.style
            );

        }

        this.player.ready(() => {

            this.addButton();

        });

        this.bindPlayer();

    }

    private bindPlayer(): void {

        this.player.on(

            "timeupdate",

            () => {

                this.manager.update(

                    this.player.currentTime() || 0

                );

            }

        );

        this.player.on(

            "dispose",

            () => this.destroy()

        );

    }

    addTrack(
        track: SubtitleTrack
    ): this {

        this.manager.addTrack(track);

        this.updateButton();

        return this;

    }

    addTracks(
        tracks: SubtitleTrack[]
    ): this {

        tracks.forEach(track => {

            this.manager.addTrack(track);

        });

        this.updateButton();

        return this;

    }

    async loadFromUrl(
        url: string,
        options?: Parameters<
            SubtitleLoader["fromUrl"]
        >[1]
    ): Promise<SubtitleTrack> {

        const track =
            await this.loader.fromUrl(
                url,
                options
            );

        this.addTrack(track);

        return track;

    }

    async loadFromFile(
        file: File,
        options?: Parameters<
            SubtitleLoader["fromFile"]
        >[1]
    ): Promise<SubtitleTrack> {

        const track =
            await this.loader.fromFile(
                file,
                options
            );

        this.addTrack(track);

        return track;

    }

    async loadFromString(
        content: string,
        options?: Parameters<
            SubtitleLoader["fromString"]
        >[1]
    ): Promise<SubtitleTrack> {

        const track =
            await this.loader.fromString(
                content,
                options
            );

        this.addTrack(track);

        return track;

    }

    async addFromFilePicker(): Promise<SubtitleTrack | null> {

        const doc =
            this.player.el()?.ownerDocument ??
            document;

        const input = doc.createElement("input");

        input.type = "file";
        input.accept = ".srt,.vtt,text/vtt,text/plain";
        input.style.display = "none";

        const track =
            await new Promise<SubtitleTrack | null>((resolve, reject) => {

                const cleanup = () => {

                    input.remove();

                };

                input.addEventListener(
                    "change",
                    async () => {

                        const file = input.files?.[0];

                        if (!file) {

                            cleanup();
                            resolve(null);
                            return;

                        }

                        try {

                            resolve(
                                await this.loadFromFile(file)
                            );

                        } catch (error) {

                            console.error(
                                "Failed to load subtitle from file",
                                error
                            );

                            reject(error);

                        } finally {

                            cleanup();

                        }

                    },
                    { once: true }
                );

                doc.body.appendChild(input);
                input.click();

            });

        if (track) {

            this.switch(track.id);

        }

        return track;

    }

    async addFromUrlPrompt(): Promise<SubtitleTrack | null> {

        const url = window.prompt(
            "Nhập URL file subtitle (.srt hoặc .vtt)"
        );

        if (!url?.trim()) {

            return null;

        }

        try {

            const track =
                await this.loadFromUrl(
                    url.trim()
                );

            this.switch(track.id);

            return track;

        } catch (error) {

            console.error(
                "Failed to load subtitle from URL",
                error
            );

            return null;

        }

    }

    openStyleEditor(): void {

        if (this.styleEditor) {

            this.styleEditor.destroy();

            return;

        }

        this.styleEditor =
            new SubtitleStyleEditor({
                container: this.player.el() as HTMLElement,
                layer: this.renderer.getElement(),
                getStyle: () => this.getStyle(),
                setStyle: style => this.setStyle(style),
                onClose: () => {

                    this.styleEditor = undefined;

                }
            });

    }

    hideSubtitles(): this {

        this.hiddenTrackIds = this.manager.getEnabledTrackIds();

        for (const track of this.manager.getEnabledTracks()) {

            this.manager.disableTrack(track.id);

        }

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    showSubtitles(): this {

        if (this.hiddenTrackIds.length === 0) {

            return this;

        }

        const trackIds = [...this.hiddenTrackIds];

        this.hiddenTrackIds = [];

        for (const trackId of trackIds) {

            this.manager.enableTrack(trackId);

        }

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    toggleSubtitleVisibility(): this {

        if (this.manager.getEnabledTracks().length > 0) {

            return this.hideSubtitles();

        }

        return this.showSubtitles();

    }

    enable(id: string): this {

        this.manager.enableTrack(id);

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    disable(id: string): this {

        this.manager.disableTrack(id);

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    toggle(id: string): this {

        if (this.manager.isTrackEnabled(id)) {

            this.manager.disableTrack(id);

        } else {

            this.manager.enableTrack(id);

        }

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    switch(id: string): this {

        for (const track of this.manager.getTracks()) {

            this.manager.disableTrack(track.id);

        }

        this.manager.enableTrack(id);

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    removeTrack(id: string): this {

        this.manager.removeTrack(id);

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    isTrackEnabled(id: string): boolean {

        return this.manager.isTrackEnabled(id);
    }

    clearTracks(): this {

        for (const track of this.manager.getTracks()) {

            this.manager.removeTrack(track.id);

        }

        this.renderer.refresh();

        this.updateButton();

        return this;

    }

    setStyle(
        style: Partial<SubtitleStyle>
    ): this {

        this.manager.setStyle(style);

        this.renderer.refresh();

        return this;

    }

    getStyle(): SubtitleStyle {

        return this.manager.getStyle();

    }

    getTracks(): SubtitleTrack[] {

        return this.manager.getTracks();

    }

    getEnabledTracks(): SubtitleTrack[] {

        return this.manager.getEnabledTracks();

    }

    hasTrack(id: string): boolean {

        return this.manager.hasTrack(id);

    }

    private addButton(): void {

        const controlBar =
            this.player.getChild(
                "ControlBar"
            );

        if (!controlBar) {

            return;

        }

        if (

            controlBar.getChild(
                "SubtitleButton"
            )

        ) {

            return;

        }

        controlBar.addChild(
            "SubtitleButton",
            {}
        );

    }

    private updateButton(): void {

        const button = this.player
            .getChild("ControlBar")
            ?.getChild("SubtitleButton") as { update?: () => void } | undefined;

        button?.update?.();

    }

    destroy(): void {

        this.styleEditor?.destroy();

        this.renderer.destroy();

        this.manager.destroy();

    }
}
