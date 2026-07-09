export function parseSrtTime(time: string): number {

    const match = time.match(
        /(\d+):(\d+):(\d+),(\d+)/
    );

    if (!match) return 0;

    const [, h, m, s, ms] = match;

    return (
        Number(h) * 3600 +
        Number(m) * 60 +
        Number(s) +
        Number(ms) / 1000
    );

}

export function parseVttTime(time: string): number {

    const match = time.match(
        /(\d+):(\d+):(\d+)\.(\d+)/
    );

    if (!match) return 0;

    const [, h, m, s, ms] = match;

    return (
        Number(h) * 3600 +
        Number(m) * 60 +
        Number(s) +
        Number(ms) / 1000
    );

}