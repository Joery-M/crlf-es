import { join } from 'path';
import { afterAll, beforeAll, bench } from 'vitest';
import { setLineEndings } from '../dist';
import { deleteTempFiles, writeRandomFiles } from './data';

let i = 0;
beforeAll(async () => {
    await deleteTempFiles();
    await writeRandomFiles(100, '\r\n');
});

afterAll(async () => {
    i = 0;
    await deleteTempFiles();
});

const path = join(import.meta.dirname, './files/*.txt');
bench(
    'glob',
    async function () {
        i++;
        await setLineEndings(path, i % 2 == 0 ? 'CRLF' : 'LF');
    },
    { time: 1000 }
);
