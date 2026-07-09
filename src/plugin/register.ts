import videojs from "video.js";

import { SubtitleButton } from "../components/subtitle/SubtitleButton";
import { SubtitleTrackItem } from "../components/subtitle/SubtitleTrackItem";

import {
    VideojsSubtitlePlugin,
    SubtitlePluginOptions
} from "./VideojsSubtitlePlugin";
import Player from "video.js/dist/types/player";

const PLUGIN_NAME = "subtitlePlus";

const instances =
    new WeakMap<
        Player,
        VideojsSubtitlePlugin
    >();

export function registerSubtitlePlus(
    videojsInstance: typeof videojs = videojs
): void {

    if (!videojsInstance.getComponent("SubtitleButton")) {

        videojsInstance.registerComponent(
            "SubtitleButton",
            SubtitleButton as unknown as any
        );

    }

    if (!videojsInstance.getComponent("SubtitleTrackItem")) {

        videojsInstance.registerComponent(
            "SubtitleTrackItem",
            SubtitleTrackItem as unknown as any
        );

    }

    if (videojsInstance.getPlugin(PLUGIN_NAME)) {

        return;

    }

    videojsInstance.registerPlugin(

        PLUGIN_NAME,

        function (
            this: Player,
            options?: SubtitlePluginOptions
        ) {

            let instance =
                instances.get(this);

            if (!instance) {

                instance =
                    new VideojsSubtitlePlugin(
                        this,
                        options
                    );

                instances.set(
                    this,
                    instance
                );

                this.one(
                    "dispose",
                    () => {

                        instance?.destroy();

                        instances.delete(this);

                    }
                );

            }

            return instance;

        }

    );

}
