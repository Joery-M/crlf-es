import { randomBytes } from 'node:crypto';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { LineEnding } from '.';

export type Arrayable<T> = T | T[];

export async function getTempFile(depth = 0): Promise<string> {
    if (depth > 100) {
        throw new Error('Could not create temporary file');
    }
    const path = join(tmpdir(), randomBytes(10).toString('hex'));
    return existsAsync(path).then((free) => (free ? getTempFile(++depth) : path));
}

// source: https://barker.codes/blog/asynchronously-check-if-a-file-exists-in-node-js/
export function existsAsync(file: string): Promise<boolean> {
    return access(file, constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

export function getEndingString(ending: LineEnding): string {
    switch (ending) {
        case 'CRLF':
            return '\r\n';
        case 'LF':
            return '\n';
        default:
            return ending;
    }
}

export async function asyncIterToArray<T>(asyncIterator: NodeJS.AsyncIterator<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const i of asyncIterator) arr.push(i);
    return arr;
}
