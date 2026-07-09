import videojs from "video.js";

import { VideojsSubtitlePlugin } from "../../plugin";
import { BaseMenuItem } from "../BaseMenuItem";
import { SubtitleTrackItem } from "./SubtitleTrackItem";
import Player from "video.js/dist/types/player";

const MenuButton = videojs.getComponent("MenuButton");

export interface SubtitleButtonOptions {

    plugin: VideojsSubtitlePlugin;

    children?: any[];

    className?: string;

}

export class SubtitleButton extends MenuButton {

    private get plugin(): VideojsSubtitlePlugin {

        return (this.player() as any).subtitlePlus();

    }

    constructor(
        player: Player,
        options: SubtitleButtonOptions
    ) {

        super(player, options);

        this.addClass(
            "vjs-subtitle-plus-button"
        );

    }

    buildCSSClass(): string {

        return `vjs-subtitle-plus-button ${super.buildCSSClass()}`;

    }

    createItems() {

        const plugin = this.plugin;

        if (!plugin) {

            return [];

        }
        const tracks = plugin?.getTracks() ?? [];
        const hideLabel =
            plugin.getEnabledTracks().length
                ? "Hide subtitles"
                : "Show subtitles";
        const items = [];
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label: "Subtitles",
                    className:
                        "vjs-subtitle-menu-heading",
                    clickable: false
                }
            )

        );

        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label: "",
                    className:
                        "vjs-subtitle-menu-divider",
                    clickable: false
                }
            )

        );
        items.push(...tracks.map(track =>

            new SubtitleTrackItem(

                this.player_,

                {

                    plugin: plugin,

                    trackId: track.id,

                    label: track.label

                }

            )

        )
        );
        /**
      * Divider
      */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label: "",
                    className:
                        "vjs-subtitle-menu-divider",
                    clickable: false
                }
            )

        );

        /**
         * Import File
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label:
                        "Import file...",
                    onClick: () => {

                        void plugin.addFromFilePicker();

                    }
                }
            )

        );

        /**
         * Import Url
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label:
                        "Import URL...",
                    onClick: () => {

                        void plugin.addFromUrlPrompt();

                    }
                }
            )

        );

        /**
         * Divider
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label: "",
                    className:
                        "vjs-subtitle-menu-divider",
                    clickable: false
                }
            )

        );

        /**
         * Style
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label:
                        "Customize...",
                    onClick: () => {

                        plugin.openStyleEditor();

                    }
                }
            )

        );

        /**
         * Divider
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label: "",
                    className:
                        "vjs-subtitle-menu-divider",
                    clickable: false
                }
            )

        );

        /**
         * Show / Hide
         */
        items.push(

            new BaseMenuItem(
                this.player_,
                {
                    label:

                        hideLabel,

                    onClick: () => {

                        plugin.toggleSubtitleVisibility();

                    }
                }
            )

        );
        return items;

    }

}