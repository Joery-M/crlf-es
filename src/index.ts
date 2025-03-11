import { createReadStream } from 'node:fs';
import type { GlobOptions } from 'tinyglobby';
import { transformFile } from './transform-file';
import { existsAsync, getEndingString, type Arrayable } from './utils';

export type LineEnding = 'CRLF' | 'LF';

export async function getFileLineEndings(
    path: string,
    options: ReadFileOptions = {}
): Promise<LineEnding | null> {
    const exists = await existsAsync(path);
    if (!exists) throw new Error(path + ': No such file or directory');

    const reader = createReadStream(path, {
        encoding: options.encoding ?? 'utf8'
    });
    const iterator = reader.iterator();

    let prevSection = '';
    for await (const chunk of iterator) {
        if (chunk == null) break;

        const section = prevSection + chunk.toString();
        const matched = section.match(/\r\n|\r|\n/);
        if (!matched) continue;

        if (section.match('\r\n')) {
            return 'CRLF';
        } else if (section.match('\n')) {
            return 'LF';
        } else {
            prevSection = section.slice(-1);
        }
    }
    return null;
}

export interface ReadFileOptions {
    /**
     * @default utf-8
     */
    encoding?: BufferEncoding;
}

export async function getStringLineEndings(source: string): Promise<LineEnding | null> {
    const matched = source.match(/\r\n|\r|\n/);
    if (!matched) return null;

    if (source.match('\r\n')) {
        return 'CRLF';
    } else if (source.match('\n')) {
        return 'LF';
    } else {
        return null;
    }
}

export async function setLineEndings(
    glob: Arrayable<string>,
    ending: LineEnding,
    options?: GlobOptions,
    force = false
): Promise<void> {
    const { glob: globProm } = await import('tinyglobby');

    const files = await globProm(glob, options);
    const newEnding = getEndingString(ending);

    const transforms$ = files.map(async (filePath) => {
        const currentEnding = await getFileLineEndings(filePath);
        if ((currentEnding === ending && !force) || currentEnding == null) return;
        const curEndingString = getEndingString(currentEnding);

        await transformFile(filePath, (chunk) => {
            return chunk?.toString().replaceAll(curEndingString, newEnding);
        });
    });

    await Promise.allSettled(transforms$);
}
