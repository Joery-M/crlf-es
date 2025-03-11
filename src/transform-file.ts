import { createReadStream, createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { existsAsync, getTempFile } from './utils';

export type TransformerFn = (chunk: string | Buffer<ArrayBufferLike> | null) => Promise<any> | any;

export async function transformFile(
    fileLocation: string,
    transformer: TransformerFn
): Promise<void> {
    const exists = await existsAsync(fileLocation);
    if (!exists) throw new Error(`File does not exist: ${fileLocation}`);

    const tmpFileLocation = await getTempFile();

    const reader = createReadStream(fileLocation);
    const writer = createWriteStream(tmpFileLocation, { mode: 0o600 });

    async function handleChunk(buffer: string | Buffer<ArrayBufferLike> | null) {
        const modified = await transformer(buffer);
        const success = writer.write(modified != null ? modified : buffer);
        if (!success) {
            await new Promise<void>((r) => writer.once('drain', r));
        }
    }

    async function handleClose() {
        await new Promise((r) => writer.end(r));

        const newWriter = createWriteStream(fileLocation);

        await new Promise<void>((resolve) => {
            createReadStream(tmpFileLocation).pipe(newWriter);
            newWriter.once('finish', async () => {
                await unlink(tmpFileLocation);
                resolve();
            });
        });
    }

    const iterator = reader.iterator();
    for await (const buffer of iterator) {
        if (buffer != null) {
            await handleChunk(buffer);
        }
    }
    await handleClose();
}
