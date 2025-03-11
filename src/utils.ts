import { randomBytes } from 'node:crypto';
import { lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type Arrayable<T> = T | T[];

export async function getTempFile(depth = 0): Promise<string> {
    if (depth > 100) {
        throw new Error('Could not create temporary file');
    }
    const path = join(tmpdir(), randomBytes(10).toString('hex'));
    return existsAsync(path).then((free) => (free ? getTempFile(++depth) : path));
}

// source: https://barker.codes/blog/asynchronously-check-if-a-file-exists-in-node-js/
export function existsAsync(file: string): Promise<'file' | 'other' | false> {
    return lstat(file)
        .then((v) => (v.isFile() ? 'file' : 'other'))
        .catch(() => false);
}

export function getEndingString(ending: string): string {
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
