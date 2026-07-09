import "video.js";

import {
    SubtitlePluginOptions,
    VideojsSubtitlePlugin
} from "../plugin";

declare module "video.js" {

    interface Player {

        subtitlePlus(
            options?: SubtitlePluginOptions
        ): VideojsSubtitlePlugin;

    }

}