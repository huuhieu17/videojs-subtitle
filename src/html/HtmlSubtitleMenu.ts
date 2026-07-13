import { SubtitleStyleEditor } from "../components/style";
import { HtmlSubtitlePlugin } from "./HtmlSubtitlePlugin";

export interface HtmlSubtitleMenuOptions {
    plugin: HtmlSubtitlePlugin;
    container: HTMLElement;
    controlBar?: HTMLElement;
    getStyleEditor: () => SubtitleStyleEditor | undefined;
}

export class HtmlSubtitleMenu {
    private readonly plugin: HtmlSubtitlePlugin;
    private readonly container: HTMLElement;
    private readonly root: HTMLDivElement;
    private readonly button: HTMLButtonElement;
    private readonly menu: HTMLDivElement;
    private readonly abortController = new AbortController();

    constructor(options: HtmlSubtitleMenuOptions) {
        this.plugin = options.plugin;
        this.container = options.container;
        this.root = document.createElement("div");
        this.button = document.createElement("button");
        this.menu = document.createElement("div");

        this.root.className = "vjs-subtitle-html-control";
        this.button.type = "button";
        this.button.className = "vjs-subtitle-html-button";
        this.button.textContent = "CC";
        this.button.setAttribute("aria-label", "Subtitles");
        this.button.setAttribute("aria-haspopup", "menu");
        this.button.setAttribute("aria-expanded", "false");
        this.menu.className = "vjs-subtitle-html-menu";
        this.menu.setAttribute("role", "menu");
        this.menu.hidden = true;

        this.root.append(this.button, this.menu);
        (options.controlBar ?? this.ensureFallbackControls()).appendChild(this.root);

        this.bind();
        this.update();
    }

    private ensureFallbackControls(): HTMLElement {
        let controls = this.container.querySelector(
            ".vjs-subtitle-html-controls"
        ) as HTMLElement | null;

        if (!controls) {
            controls = document.createElement("div");
            controls.className = "vjs-subtitle-html-controls";
            this.container.appendChild(controls);
        }

        return controls;
    }

    private bind(): void {
        const signal = this.abortController.signal;

        this.button.addEventListener("click", event => {
            event.stopPropagation();
            this.setOpen(this.menu.hidden);
        }, { signal });

        document.addEventListener("click", event => {
            if (!this.root.contains(event.target as Node)) {
                this.setOpen(false);
            }
        }, { signal });
    }

    private setOpen(open: boolean): void {
        this.menu.hidden = !open;
        this.button.setAttribute("aria-expanded", String(open));

        if (open) {
            this.update();
        }
    }

    private createItem(label: string, onClick: () => void, selected = false): HTMLButtonElement {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "vjs-subtitle-html-menu-item";
        item.textContent = label;
        item.setAttribute("role", "menuitem");

        if (selected) {
            item.classList.add("is-selected");
            item.setAttribute("aria-checked", "true");
        }

        item.addEventListener("click", event => {
            event.stopPropagation();
            onClick();
            this.update();
        });

        return item;
    }

    private createDivider(): HTMLDivElement {
        const divider = document.createElement("div");

        divider.className = "vjs-subtitle-html-menu-divider";

        return divider;
    }

    update(): void {
        const tracks = this.plugin.getTracks();
        const heading = document.createElement("div");
        const hideLabel = this.plugin.getEnabledTracks().length
            ? "Hide subtitles"
            : "Show subtitles";

        heading.className = "vjs-subtitle-html-menu-heading";
        heading.textContent = "Subtitles";
        this.menu.replaceChildren(heading, this.createDivider());

        if (tracks.length === 0) {
            const empty = document.createElement("div");

            empty.className = "vjs-subtitle-html-menu-empty";
            empty.textContent = "No subtitle tracks";
            this.menu.appendChild(empty);
        } else {
            for (const track of tracks) {
                this.menu.appendChild(
                    this.createItem(
                        track.label,
                        () => this.plugin.toggle(track.id),
                        this.plugin.isTrackEnabled(track.id)
                    )
                );
            }
        }

        this.menu.append(
            this.createDivider(),
            this.createItem("Import file...", () => void this.plugin.addFromFilePicker()),
            this.createItem("Import URL...", () => void this.plugin.addFromUrlPrompt()),
            this.createDivider(),
            this.createItem("Customize...", () => this.plugin.openStyleEditor()),
            this.createDivider(),
            this.createItem(hideLabel, () => this.plugin.toggleSubtitleVisibility())
        );
    }

    destroy(): void {
        this.abortController.abort();
        this.root.remove();
    }
}
