import { SubtitleStyle } from "../../types";

export interface SubtitleStyleEditorOptions {
    container: HTMLElement;
    layer: HTMLElement;
    getStyle: () => SubtitleStyle;
    setStyle: (style: Partial<SubtitleStyle>) => void;
    onClose?: () => void;
}

export class SubtitleStyleEditor {
    private readonly options: SubtitleStyleEditorOptions;
    private readonly element: HTMLDivElement;
    private readonly positionSelect: HTMLSelectElement;
    private readonly abortController = new AbortController();
    private dragging = false;

    constructor(options: SubtitleStyleEditorOptions) {
        this.options = options;
        this.element = this.createElement();
        this.positionSelect = this.element.querySelector(
            "[data-subtitle-style-position]"
        ) as HTMLSelectElement;

        this.options.container.appendChild(this.element);
        this.enableLayerDrag();
    }

    private createElement(): HTMLDivElement {
        const style = this.options.getStyle();
        const element = document.createElement("div");

        element.className = "vjs-subtitle-style-editor";
        element.innerHTML = `
            <div class="vjs-subtitle-style-editor__header">
                <span>Subtitle Style</span>
                <button type="button" class="vjs-subtitle-style-editor__close" aria-label="Close">x</button>
            </div>
            <label class="vjs-subtitle-style-editor__row">
                <span>Color</span>
                <input type="color" value="${this.toColorValue(style.color, "#ffffff")}" data-subtitle-style-color>
            </label>
            <label class="vjs-subtitle-style-editor__row">
                <span>Size</span>
                <span class="vjs-subtitle-style-editor__size">
                    <input type="range" min="12" max="72" step="1" value="${style.fontSize ?? 28}" data-subtitle-style-size>
                    <input type="number" min="12" max="72" step="1" value="${style.fontSize ?? 28}" data-subtitle-style-size-number>
                </span>
            </label>
            <label class="vjs-subtitle-style-editor__row">
                <span>Font</span>
                <select data-subtitle-style-font>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="monospace">Monospace</option>
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="custom">Custom...</option>
                </select>
            </label>
            <label class="vjs-subtitle-style-editor__row vjs-subtitle-style-editor__custom-font">
                <span>Custom</span>
                <input type="text" value="${style.fontFamily ?? "Arial"}" data-subtitle-style-custom-font>
            </label>
            <label class="vjs-subtitle-style-editor__row">
                <span>Position</span>
                <select data-subtitle-style-position>
                    <option value="bottom">Bottom</option>
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                </select>
            </label>
            <label class="vjs-subtitle-style-editor__row">
                <span>Background</span>
                <input type="color" value="${this.toColorValue(style.background, "#000000")}" data-subtitle-style-background>
            </label>
            <label class="vjs-subtitle-style-editor__check">
                <input type="checkbox" ${style.background === "transparent" ? "checked" : ""} data-subtitle-style-transparent>
                <span>Transparent background</span>
            </label>
            <label class="vjs-subtitle-style-editor__row">
                <span>Opacity</span>
                <input type="range" min="0.2" max="1" step="0.05" value="${style.opacity ?? 1}" data-subtitle-style-opacity>
            </label>
        `;

        this.bindControls(element);

        return element;
    }

    private bindControls(element: HTMLElement): void {
        const signal = this.abortController.signal;
        const color = element.querySelector("[data-subtitle-style-color]") as HTMLInputElement;
        const size = element.querySelector("[data-subtitle-style-size]") as HTMLInputElement;
        const sizeNumber = element.querySelector("[data-subtitle-style-size-number]") as HTMLInputElement;
        const font = element.querySelector("[data-subtitle-style-font]") as HTMLSelectElement;
        const customFont = element.querySelector("[data-subtitle-style-custom-font]") as HTMLInputElement;
        const customFontRow = element.querySelector(".vjs-subtitle-style-editor__custom-font") as HTMLElement;
        const position = element.querySelector("[data-subtitle-style-position]") as HTMLSelectElement;
        const background = element.querySelector("[data-subtitle-style-background]") as HTMLInputElement;
        const transparent = element.querySelector("[data-subtitle-style-transparent]") as HTMLInputElement;
        const opacity = element.querySelector("[data-subtitle-style-opacity]") as HTMLInputElement;
        const close = element.querySelector(".vjs-subtitle-style-editor__close") as HTMLButtonElement;

        position.value = this.options.getStyle().position ?? "bottom";

        const currentFont = this.options.getStyle().fontFamily ?? "Arial";
        const fontOption = Array.from(font.options).find(option => option.value === currentFont);

        font.value = fontOption ? currentFont : "custom";
        customFontRow.hidden = font.value !== "custom";

        color.addEventListener("input", () => {
            this.options.setStyle({ color: color.value });
        }, { signal });

        const setSize = (value: string) => {
            const next = this.clamp(Number(value), 12, 72);

            size.value = String(next);
            sizeNumber.value = String(next);
            this.options.setStyle({ fontSize: next });
        };

        size.addEventListener("input", () => setSize(size.value), { signal });
        sizeNumber.addEventListener("input", () => setSize(sizeNumber.value), { signal });

        font.addEventListener("change", () => {
            const isCustom = font.value === "custom";

            customFontRow.hidden = !isCustom;

            this.options.setStyle({
                fontFamily: isCustom ? customFont.value : font.value
            });
        }, { signal });

        customFont.addEventListener("input", () => {
            if (font.value === "custom") {
                this.options.setStyle({
                    fontFamily: customFont.value
                });
            }
        }, { signal });

        position.addEventListener("change", () => {
            this.options.setStyle({
                position: position.value as SubtitleStyle["position"]
            });
        }, { signal });

        background.addEventListener("input", () => {
            if (!transparent.checked) {
                this.options.setStyle({ background: background.value });
            }
        }, { signal });

        transparent.addEventListener("change", () => {
            this.options.setStyle({
                background: transparent.checked ? "transparent" : background.value
            });
        }, { signal });

        opacity.addEventListener("input", () => {
            this.options.setStyle({ opacity: Number(opacity.value) });
        }, { signal });

        close.addEventListener("click", () => this.destroy(), { signal });
    }

    private enableLayerDrag(): void {
        const layer = this.options.layer;
        const signal = this.abortController.signal;

        layer.classList.add("vjs-subtitle-plus-editing");

        layer.addEventListener("pointerdown", event => {
            this.dragging = true;
            layer.setPointerCapture(event.pointerId);
        }, { signal });

        layer.addEventListener("pointermove", event => {
            if (!this.dragging) {
                return;
            }

            this.moveLayer(event.clientY);
        }, { signal });

        layer.addEventListener("pointerup", event => {
            this.dragging = false;
            layer.releasePointerCapture(event.pointerId);
        }, { signal });
    }

    private moveLayer(clientY: number): void {
        const containerRect = this.options.container.getBoundingClientRect();
        const layerRect = this.options.layer.getBoundingClientRect();
        const bottom = this.clamp(
            containerRect.bottom - clientY - layerRect.height / 2,
            12,
            Math.max(12, containerRect.height - layerRect.height - 12)
        );

        this.positionSelect.value = "bottom";
        this.options.setStyle({
            position: "bottom",
            bottom: Math.round(bottom)
        });
    }

    private toColorValue(value: string | undefined, fallback: string): string {
        if (value && /^#[0-9a-f]{6}$/i.test(value)) {
            return value;
        }

        return fallback;
    }

    private clamp(value: number, min: number, max: number): number {
        if (Number.isNaN(value)) {
            return min;
        }

        return Math.min(max, Math.max(min, value));
    }

    destroy(): void {
        this.abortController.abort();
        this.options.layer.classList.remove("vjs-subtitle-plus-editing");
        this.element.remove();
        this.options.onClose?.();
    }
}
