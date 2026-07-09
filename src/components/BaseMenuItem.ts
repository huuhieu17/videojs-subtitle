
import videojs from "video.js";
import Player from "video.js/dist/types/player";


const MenuItem = videojs.getComponent("MenuItem") as any;

export interface BaseMenuItemOptions {

    label: string;

    selectable?: boolean;

    clickable?: boolean;

    selected?: boolean;

    className?: string;

    onClick?: () => void;

}

export class BaseMenuItem extends MenuItem {

    protected readonly config:
        BaseMenuItemOptions;

    constructor(
    player: Player,
    config: BaseMenuItemOptions
) {

    super(player, {

        selectable: config.selectable ?? false,

        selected: config.selected ?? false

    });

    this.config = config;

    this.el().classList.add(
        "vjs-subtitle-menu-item"
    );

    if (config.className) {

        this.el().classList.add(
            config.className
        );

    }

    const label = document.createElement("span");

    label.className = "vjs-menu-item-text";

    label.textContent = config.label;

    this.el().appendChild(label);

}

    protected setLabel(
        text: string
    ): void {

        let span =
            this.el().querySelector(
                ".vjs-menu-item-text"
            ) as HTMLSpanElement | null;

        if (!span) {

            span =
                document.createElement(
                    "span"
                );

            span.className =
                "vjs-menu-item-text";

            this.el().appendChild(
                span
            );

        }

        span.textContent = text;

    }

    handleClick(event?: Event): void {

        if (this.config.clickable === false) {

            return;

        }

        super.handleClick(event as Event);

        this.config.onClick?.();

    }

    setSelected(selected: boolean): void {

        this.selected(selected);

    }

    getLabel(): string {

        return this.config.label;

    }

}