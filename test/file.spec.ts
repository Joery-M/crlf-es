import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getFileLineEndings, setLineEndings } from '../dist/index';
import { deleteTempFiles, testData, writeFiles } from './data';

describe('File', () => {
    beforeAll(async () => {
        await writeFiles();
    });

    afterAll(async () => {
        await deleteTempFiles();
    });

    test.each(Array.from(testData.entries()))(
        'Detect and Write files %s',
        async (path, content) => {
            const res1 = await getFileLineEndings(path);
            expect(res1).toBe(content.ending);
            await setLineEndings(path, content.ending === 'CRLF' ? 'LF' : 'CRLF');

            const res2 = await getFileLineEndings(path);
            if (content.ending != null) {
                expect(res2).not.toBe(content.ending);
                expect(res2).not.toBe(res1);
            } else {
                // Null stays the same
                expect(res2).toBe(content.ending);
                expect(res2).toBe(res1);
            }
        }
    );
});
