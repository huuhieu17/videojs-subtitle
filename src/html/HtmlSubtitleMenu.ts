import { SubtitleStyleEditor } from "../components/style";
import { HtmlSubtitlePlugin } from "./HtmlSubtitlePlugin";

export interface HtmlSubtitleMenuOptions {
    plugin: HtmlSubtitlePlugin;
    container: HTMLElement;
    controlBar?: HTMLElement;
    placement?: HtmlSubtitleButtonPlacement;
    getStyleEditor: () => SubtitleStyleEditor | undefined;
}

export type HtmlSubtitleButtonPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export type HtmlSubtitleButtonPlacement =
    | "control-bar"
    | HtmlSubtitleButtonPosition;

export class HtmlSubtitleMenu {
    private readonly plugin: HtmlSubtitlePlugin;
    private readonly container: HTMLElement;
    private readonly controlBar?: HTMLElement;
    private readonly root: HTMLDivElement;
    private readonly button: HTMLButtonElement;
    private readonly menu: HTMLDivElement;
    private readonly abortController = new AbortController();
    private placement: HtmlSubtitleButtonPlacement;

    constructor(options: HtmlSubtitleMenuOptions) {
        this.plugin = options.plugin;
        this.container = options.container;
        this.controlBar = options.controlBar;
        this.placement =
            options.placement ??
            (options.controlBar ? "control-bar" : "top-right");
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
        this.applyPlacement(this.placement);

        this.bind();
        this.update();
    }

    private ensureFallbackControls(
        position: HtmlSubtitleButtonPosition
    ): HTMLElement {
        let controls = this.container.querySelector(
            ".vjs-subtitle-html-controls"
        ) as HTMLElement | null;

        if (!controls) {
            controls = document.createElement("div");
            this.container.appendChild(controls);
        }

        controls.className =
            `vjs-subtitle-html-controls vjs-subtitle-html-controls--${position}`;

        return controls;
    }

    setPlacement(
        placement: HtmlSubtitleButtonPlacement
    ): void {
        this.applyPlacement(placement);
        this.update();
    }

    getPlacement(): HtmlSubtitleButtonPlacement {
        return this.placement;
    }

    private applyPlacement(
        placement: HtmlSubtitleButtonPlacement
    ): void {
        const nextPlacement =
            placement === "control-bar" && !this.controlBar
                ? "top-right"
                : placement;

        this.placement = nextPlacement;
        this.root.classList.remove(
            "vjs-subtitle-html-control--inline",
            "vjs-subtitle-html-control--fallback"
        );

        if (nextPlacement === "control-bar") {
            this.root.classList.add("vjs-subtitle-html-control--inline");
            this.controlBar?.appendChild(this.root);
            return;
        }

        this.root.classList.add("vjs-subtitle-html-control--fallback");
        this.ensureFallbackControls(nextPlacement).appendChild(this.root);
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

    private createPositionControl(): HTMLElement {
        const row = document.createElement("label");
        const label = document.createElement("span");
        const select = document.createElement("select");
        const options: Array<{
            label: string;
            placement: HtmlSubtitleButtonPlacement;
            disabled?: boolean;
        }> = [
            {
                label: "Button: Control bar",
                placement: "control-bar",
                disabled: !this.controlBar
            },
            {
                label: "Button: Top left",
                placement: "top-left"
            },
            {
                label: "Button: Top right",
                placement: "top-right"
            },
            {
                label: "Button: Bottom left",
                placement: "bottom-left"
            },
            {
                label: "Button: Bottom right",
                placement: "bottom-right"
            }
        ];

        row.className = "vjs-subtitle-html-menu-select";
        label.textContent = "CC button";
        select.setAttribute("aria-label", "CC button position");

        for (const option of options) {
            const item = document.createElement("option");

            item.value = option.placement;
            item.textContent = option.label.replace("Button: ", "");
            item.disabled = option.disabled ?? false;
            select.appendChild(item);
        }

        select.value = this.placement;
        select.addEventListener("change", () => {
            this.setPlacement(select.value as HtmlSubtitleButtonPlacement);
        });

        row.append(label, select);

        return row;
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
            this.createPositionControl(),
            this.createDivider(),
            this.createItem(hideLabel, () => this.plugin.toggleSubtitleVisibility())
        );
    }

    destroy(): void {
        this.abortController.abort();
        this.root.remove();
    }
}
