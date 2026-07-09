import { FileSource } from "./FileSource";
import { UrlSource } from "./UrlSource";
import { StringSource } from "./StringSource";
import { LoadSubtitleOptions } from "./SubtitleSource";

export class SubtitleLoader {

    private readonly url =
        new UrlSource();

    private readonly file =
        new FileSource();

    private readonly text =
        new StringSource();

    fromUrl(
        url: string,
        options?: LoadSubtitleOptions
    ) {

        return this.url.load(
            url,
            options
        );

    }

    fromFile(
        file: File,
        options?: LoadSubtitleOptions
    ) {

        return this.file.load(
            file,
            options
        );

    }

    fromString(
        content: string,
        options?: LoadSubtitleOptions
    ) {

        return this.text.load(
            content,
            options
        );

    }

}