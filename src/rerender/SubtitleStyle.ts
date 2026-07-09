import { SubtitleStyle } from "../types";

export class SubtitleStyleManager {

    /**
     * Apply style for subtitle layer
     */
    applyLayer(
        element: HTMLElement,
        style: SubtitleStyle
    ): void {

        const css = element.style;

        css.left = "50%";
        css.transform = "translateX(-50%)";

        css.top = "";
        css.bottom = "";

        switch (style.position) {

            case "top":

                css.top = `${style.top ?? 24}px`;

                break;

            case "center":

                css.top = "50%";
                css.transform = "translate(-50%, -50%)";

                break;

            default:

                css.bottom = `${style.bottom ?? 40}px`;

        }

    }

    /**
     * Apply style for one subtitle line
     */
    applyLine(
        element: HTMLElement,
        style: SubtitleStyle
    ): void {

        const css = element.style;

        if (style.color)
            css.color = style.color;

        if (style.background)
            css.background = style.background;

        if (style.fontFamily)
            css.fontFamily = style.fontFamily;

        if (style.fontSize)
            css.fontSize = `${style.fontSize}px`;

        if (style.fontWeight)
            css.fontWeight = String(style.fontWeight);

        if (style.fontStyle)
            css.fontStyle = style.fontStyle;

        if (style.opacity != null)
            css.opacity = String(style.opacity);

        if (style.lineHeight)
            css.lineHeight = String(style.lineHeight);

        if (style.letterSpacing != null)
            css.letterSpacing = `${style.letterSpacing}px`;

        if (style.padding)
            css.padding = style.padding;

        if (style.borderRadius != null)
            css.borderRadius = `${style.borderRadius}px`;

        if (style.maxWidth)
            css.maxWidth = style.maxWidth;

        if (style.textAlign)
            css.textAlign = style.textAlign;

        if (style.textShadow)
            css.textShadow = style.textShadow;

        if (style.textStroke) {

            css.setProperty(
                "-webkit-text-stroke",
                style.textStroke
            );

        }

    }

    reset(
        element: HTMLElement
    ): void {

        element.removeAttribute("style");

    }

}