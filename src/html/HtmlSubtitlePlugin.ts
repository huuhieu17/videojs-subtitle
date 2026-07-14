import { SubtitleManager } from "../core/SubtitleManager";
import { SubtitleLoader } from "../loader/SubtitleLoader";
import { SubtitleRenderer } from "../rerender/SubtitleRerender";
import { SubtitleStyle, SubtitleTrack } from "../types";
import { SubtitleStyleEditor } from "../components/style";
import { SubtitlePlayerHost } from "../player/SubtitlePlayerHost";
import {
    HtmlSubtitleButtonPlacement,
    HtmlSubtitleButtonPosition,
    HtmlSubtitleMenu
} from "./HtmlSubtitleMenu";

export interface HtmlSubtitleOptions {
    style?: SubtitleStyle;
    container?: HTMLElement | string;
    controlBar?: HTMLElement | string;
    video?: HTMLMediaElement | string;
    button?: boolean;
    buttonPlacement?: HtmlSubtitleButtonPlacement;
    buttonPosition?: HtmlSubtitleButtonPosition;
}

export type HtmlSubtitleTarget = HTMLMediaElement | HTMLElement | {
    el?: () => HTMLElement;
    currentTime?: () => number;
    on?: (event: string, handler: () => void) => void;
    off?: (event: string, handler: () => void) => void;
    ready?: (handler: () => void) => void;
    dispose?: () => void;
};

export class HtmlSubtitlePlugin {
    private readonly target: HtmlSubtitleTarget;
    private readonly host: SubtitlePlayerHost;
    private readonly container: HTMLElement;
    private readonly media?: HTMLMediaElement;
    private readonly manager = new SubtitleManager();
    private readonly loader = new SubtitleLoader();
    private readonly renderer: SubtitleRenderer;
    private readonly abortController = new AbortController();
    private readonly buttonPlacement?: HtmlSubtitleButtonPlacement;
    private menu?: HtmlSubtitleMenu;
    private hiddenTrackIds: string[] = [];
    private styleEditor?: SubtitleStyleEditor;

    constructor(target: HtmlSubtitleTarget, options?: HtmlSubtitleOptions) {
        this.target = target;
        this.buttonPlacement = options?.buttonPlacement ?? options?.buttonPosition;
        this.media = this.resolveMedia(target, options?.video);
        this.container = this.resolveContainer(target, options?.container);
        this.host = {
            el: () => this.container,
            currentTime: () => this.getCurrentTime()
        };
        this.renderer = new SubtitleRenderer(this.host, this.manager);

        this.container.classList.add("vjs-subtitle-html-container");

        if (getComputedStyle(this.container).position === "static") {
            this.container.style.position = "relative";
        }

        if (options?.style) {
            this.manager.setStyle(options.style);
        }

        this.bindTarget();

        if (options?.button !== false) {
            this.ready(() => this.addButton(options?.controlBar));
        }
    }

    private resolveElement(value?: HTMLElement | string): HTMLElement | undefined {
        if (!value) {
            return undefined;
        }

        return typeof value === "string"
            ? document.querySelector(value) as HTMLElement | null ?? undefined
            : value;
    }

    private resolveMedia(target: HtmlSubtitleTarget, value?: HTMLMediaElement | string): HTMLMediaElement | undefined {
        const explicit = this.resolveElement(value) as HTMLMediaElement | undefined;

        if (explicit instanceof HTMLMediaElement) {
            return explicit;
        }

        if (target instanceof HTMLMediaElement) {
            return target;
        }

        if (target instanceof HTMLElement) {
            return target.matches("video,audio")
                ? target as HTMLMediaElement
                : target.querySelector("video,audio") as HTMLMediaElement | null ?? undefined;
        }

        const element = target.el?.();

        return element?.querySelector("video,audio") as HTMLMediaElement | null ?? undefined;
    }

    private resolveContainer(target: HtmlSubtitleTarget, value?: HTMLElement | string): HTMLElement {
        const explicit = this.resolveElement(value);

        if (explicit) {
            return explicit;
        }

        if (!(target instanceof HTMLElement) && target.el) {
            return target.el();
        }

        if (target instanceof HTMLMediaElement) {
            return target.parentElement ?? target;
        }

        if (target instanceof HTMLElement) {
            return target;
        }

        throw new Error("A subtitle container is required for @videojs/html playback.");
    }

    private ready(handler: () => void): void {
        if (!(this.target instanceof HTMLElement) && this.target.ready) {
            this.target.ready(handler);
            return;
        }

        handler();
    }

    private bindTarget(): void {
        const update = () => {
            this.manager.update(this.getCurrentTime());
        };

        if (this.media) {
            this.media.addEventListener("timeupdate", update, {
                signal: this.abortController.signal
            });
        } else if (!(this.target instanceof HTMLElement) && this.target.on) {
            this.target.on("timeupdate", update);
        }
    }

    private getCurrentTime(): number {
        if (!(this.target instanceof HTMLElement) && this.target.currentTime) {
            return this.target.currentTime() || 0;
        }

        return this.media?.currentTime ?? 0;
    }

    private resolveControlBar(value?: HTMLElement | string): HTMLElement | undefined {
        const explicit = this.resolveElement(value);

        if (explicit) {
            return explicit;
        }

        return this.container.querySelector(
            "media-controls, .media-controls, .vjs-control-bar, .vjs-controls, .video-js-control-bar, .videojs-control-bar, [data-vjs-control-bar], [data-control-bar], [part='control-bar']"
        ) as HTMLElement | null ?? undefined;
    }

    private addButton(controlBar?: HTMLElement | string): void {
        if (this.menu) {
            return;
        }

        this.menu = new HtmlSubtitleMenu({
            plugin: this,
            container: this.container,
            controlBar: this.resolveControlBar(controlBar),
            placement: this.buttonPlacement,
            getStyleEditor: () => this.styleEditor
        });
    }

    private updateButton(): void {
        this.menu?.update();
    }

    addTrack(track: SubtitleTrack): this {
        this.manager.addTrack(track);
        this.updateButton();
        return this;
    }

    addTracks(tracks: SubtitleTrack[]): this {
        tracks.forEach(track => this.manager.addTrack(track));
        this.updateButton();
        return this;
    }

    async loadFromUrl(url: string, options?: Parameters<SubtitleLoader["fromUrl"]>[1]): Promise<SubtitleTrack> {
        const track = await this.loader.fromUrl(url, options);

        this.addTrack(track);

        return track;
    }

    async loadFromFile(file: File, options?: Parameters<SubtitleLoader["fromFile"]>[1]): Promise<SubtitleTrack> {
        const track = await this.loader.fromFile(file, options);

        this.addTrack(track);

        return track;
    }

    async loadFromString(content: string, options?: Parameters<SubtitleLoader["fromString"]>[1]): Promise<SubtitleTrack> {
        const track = await this.loader.fromString(content, options);

        this.addTrack(track);

        return track;
    }

    async addFromFilePicker(): Promise<SubtitleTrack | null> {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = ".srt,.vtt,text/vtt,text/plain";
        input.style.display = "none";

        const track = await new Promise<SubtitleTrack | null>((resolve, reject) => {
            input.addEventListener("change", async () => {
                const file = input.files?.[0];

                if (!file) {
                    input.remove();
                    resolve(null);
                    return;
                }

                try {
                    resolve(await this.loadFromFile(file));
                } catch (error) {
                    reject(error);
                } finally {
                    input.remove();
                }
            }, { once: true });

            document.body.appendChild(input);
            input.click();
        });

        if (track) {
            this.switch(track.id);
        }

        return track;
    }

    async addFromUrlPrompt(): Promise<SubtitleTrack | null> {
        const url = window.prompt("Nhap URL file subtitle (.srt hoac .vtt)");

        if (!url?.trim()) {
            return null;
        }

        try {
            const track = await this.loadFromUrl(url.trim());

            this.switch(track.id);

            return track;
        } catch (error) {
            console.error("Failed to load subtitle from URL", error);
            return null;
        }
    }

    openStyleEditor(): void {
        if (this.styleEditor) {
            this.styleEditor.destroy();
            return;
        }

        this.styleEditor = new SubtitleStyleEditor({
            container: this.container,
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
        this.manager.getEnabledTracks().forEach(track => this.manager.disableTrack(track.id));
        this.renderer.refresh();
        this.updateButton();
        return this;
    }

    showSubtitles(): this {
        const trackIds = [...this.hiddenTrackIds];

        this.hiddenTrackIds = [];
        trackIds.forEach(trackId => this.manager.enableTrack(trackId));
        this.renderer.refresh();
        this.updateButton();

        return this;
    }

    toggleSubtitleVisibility(): this {
        return this.manager.getEnabledTracks().length > 0
            ? this.hideSubtitles()
            : this.showSubtitles();
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
        return this.isTrackEnabled(id) ? this.disable(id) : this.enable(id);
    }

    switch(id: string): this {
        this.manager.getTracks().forEach(track => this.manager.disableTrack(track.id));
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
        this.manager.getTracks().forEach(track => this.manager.removeTrack(track.id));
        this.renderer.refresh();
        this.updateButton();
        return this;
    }

    setStyle(style: Partial<SubtitleStyle>): this {
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

    setButtonPlacement(
        placement: HtmlSubtitleButtonPlacement
    ): this {
        this.menu?.setPlacement(placement);

        return this;
    }

    getButtonPlacement(): HtmlSubtitleButtonPlacement | undefined {
        return this.menu?.getPlacement();
    }

    destroy(): void {
        this.abortController.abort();
        this.styleEditor?.destroy();
        this.menu?.destroy();
        this.renderer.destroy();
        this.manager.destroy();
    }
}
