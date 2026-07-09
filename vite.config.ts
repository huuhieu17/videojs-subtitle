import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "VideojsSubtitlePlus",
            formats: ["es", "umd"],
            fileName: (format) =>
                format === "es"
                    ? "videojs-subtitle.js"
                    : "videojs-subtitle.umd.cjs"
        },
        cssCodeSplit: false,

        rollupOptions: {
            external: ["video.js"],
            output: {
                globals: {
                    "video.js": "videojs"
                }
            }
        }
    },
});