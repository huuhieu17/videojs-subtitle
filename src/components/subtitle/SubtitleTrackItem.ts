import videojs from "video.js";


import { VideojsSubtitlePlugin } from "../../plugin";
import { BaseMenuItem } from "../BaseMenuItem";
import Player from "video.js/dist/types/player";

export interface SubtitleTrackItemOptions {

    plugin: VideojsSubtitlePlugin;

    trackId: string;

    label: string;

}

export class SubtitleTrackItem extends BaseMenuItem {

    private readonly plugin: VideojsSubtitlePlugin;

    private readonly trackId: string;

    constructor(
        player: Player,
        config: SubtitleTrackItemOptions
    ) {

        super(player, {

            label: config.label,

            selectable: true,

            selected: config
                .plugin
                .isTrackEnabled(config.trackId)

        });

        this.plugin = config.plugin;

        this.trackId = config.trackId;

    }

    handleClick(event?: Event): void {

        super.handleClick(event);

        this.plugin.toggle(this.trackId);

        this.setSelected(

            this.plugin.isTrackEnabled(
                this.trackId
            )

        );

    }

    /**
     * Refresh selected state
     */
    refresh(): void {

        this.setSelected(

            this.plugin.isTrackEnabled(
                this.trackId
            )

        );

    }

}