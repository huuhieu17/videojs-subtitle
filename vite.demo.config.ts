import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    root: "demo",
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "demo/index.html")
            }
        }
    }
});
