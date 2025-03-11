import { expect, test } from 'vitest';
import { getStringLineEndings } from '../dist/index';
import { testData } from './data';

test.each([...testData.values()])('strings', async ({ text, ending }) => {
    const le = await getStringLineEndings(text);
    expect(le).toBe(ending);
});
