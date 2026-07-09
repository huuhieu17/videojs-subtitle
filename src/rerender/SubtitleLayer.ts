export class SubtitleLayer {

    /**
     * Root layer
     */
    private readonly element: HTMLDivElement;

    constructor(container: HTMLElement) {

        this.element = document.createElement("div");

        this.element.className = "vjs-subtitle-plus";

        container.appendChild(this.element);

    }

    /**
     * Root element
     */
    getElement(): HTMLDivElement {

        return this.element;

    }

    /**
     * Render subtitle DOM
     */
    render(
        fragment: DocumentFragment
    ): void {

        this.element.replaceChildren(fragment);

    }

    /**
     * Clear layer
     */
    clear(): void {

        this.element.replaceChildren();

    }

    /**
     * Show layer
     */
    show(): void {

        this.element.classList.remove("hidden");

    }

    /**
     * Hide layer
     */
    hide(): void {

        this.element.classList.add("hidden");

    }

    /**
     * Destroy
     */
    destroy(): void {

        this.element.remove();

    }

}