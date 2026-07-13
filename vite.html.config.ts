import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, "src/html.ts"),
            formats: ["es"],
            fileName: () => "html.js"
        }
    }
});
