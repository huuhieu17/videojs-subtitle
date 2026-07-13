export * from "./HtmlSubtitlePlugin";

import {
    HtmlSubtitleOptions,
    HtmlSubtitlePlugin,
    HtmlSubtitleTarget
} from "./HtmlSubtitlePlugin";

const instances = new WeakMap<object, HtmlSubtitlePlugin>();

export function createHtmlSubtitle(
    target: HtmlSubtitleTarget,
    options?: HtmlSubtitleOptions
): HtmlSubtitlePlugin {
    if (typeof target === "object") {
        const cached = instances.get(target);

        if (cached) {
            return cached;
        }
    }

    const plugin = new HtmlSubtitlePlugin(target, options);

    if (typeof target === "object") {
        instances.set(target, plugin);
    }

    return plugin;
}
