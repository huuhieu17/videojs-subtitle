import { SubtitleLine } from "./SubtitleLine";

export class SubtitleLinePool {

    private readonly pool: SubtitleLine[] = [];

    /**
     * Get line
     */
    acquire(): SubtitleLine {

        return this.pool.pop()

            ?? new SubtitleLine();

    }

    /**
     * Return line
     */
    release(
        line: SubtitleLine
    ): void {

        line.clear();

        this.pool.push(line);

    }

    /**
     * Clear pool
     */
    clear(): void {

        this.pool.length = 0;

    }

}