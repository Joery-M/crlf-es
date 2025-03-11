import { existsSync } from 'node:fs';
import { glob, mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const testData: Map<
    string,
    {
        text: string;
        ending: string | null;
    }
> = new Map([
    [
        join(import.meta.dirname, './files/1.txt'),
        {
            text: 'Supervisor\r\nCompatible Louisiana\r\ntransmitting deposit JBOD Avon Incredible synergize',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/2.txt'),
        {
            text: 'Concrete Bike\r\nwell-modulated\r\nwithdrawal Soft Gloves compress Beauty',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/3.txt'),
        {
            text: 'Tools database\r\nSCSI online interactive SMS\r\nUsability Plastic Fresh',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/4.txt'),
        {
            text: 'Plastic\nGorgeous\nAccount non-volatile\noptical Optimization alarm De-engineered',
            ending: 'LF'
        }
    ],
    [
        join(import.meta.dirname, './files/5.txt'),
        {
            text: 'Divide\r\nTugrik Coordinator red\r\nMetal transmitting redundant cross-media',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/6.txt'),
        {
            text: 'pink monetize\r\nChecking optical\r\nexperiences invoice Estonia Data connecting',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/7.txt'),
        {
            text: 'pink monetize Checking optical experiences invoice Estonia Data connecting',
            ending: null
        }
    ],
    [
        join(import.meta.dirname, './files/8.txt'),
        {
            text: 'calculating programming\nindexing Mexico\nredundant Account neural copying Granite white',
            ending: 'LF'
        }
    ],
    [
        join(import.meta.dirname, './files/9.txt'),
        {
            text: 'Innovative\r\nHandcrafted Mobility Vision-oriented\r\nHandmade Industrial',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/10.txt'),
        {
            text: 'Shirt\nCambridgeshire\nVersatile\nIncredible Convertible\nRe-contextualized middleware USB Account primary eyeballs',
            ending: 'LF'
        }
    ],
    [
        join(import.meta.dirname, './files/11.txt'),
        {
            text: 'Steel payment Inverse\noverride Manat Generic\nWooden Cape navigating Lilangeni deposit',
            ending: 'LF'
        }
    ],
    [
        join(import.meta.dirname, './files/12.txt'),
        {
            text: 'Steel payment Inverse override Manat Generic Wooden Cape navigating Lilangeni deposit',
            ending: null
        }
    ],
    [
        join(import.meta.dirname, './files/13.txt'),
        {
            text: 'XML Personal\r\nworkforce Pizza unleash mobile\r\nPrincipal teal incubate',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/14.txt'),
        {
            text: 'magnetic Cambridgeshire Producer\r\nRe-contextualized Wooden\r\nMinnesota deposit',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/15.txt'),
        {
            text: 'moderator Keyboard\r\nOrchestrator facilitate parsing Grocery\r\nquantifying mission-critical Chair architectures',
            ending: 'CRLF'
        }
    ],
    [
        join(import.meta.dirname, './files/16.txt'),
        {
            text: 'Court Garden drive\nGranite Sausages\ndeliverables Awesome Texas District',
            ending: 'LF'
        }
    ],
    [
        join(import.meta.dirname, './files/17.txt'),
        {
            text: 'Tools JBOD\nnavigating Mouse connecting\nMovies Fundamental Supervisor open-source back-end Island',
            ending: 'LF'
        }
    ]
]);

export async function writeFiles(): Promise<void> {
    // Make dir if it doesn't exist
    const dirPath = join(import.meta.dirname, './files/');
    existsSync(dirPath) || (await mkdir(dirPath, { recursive: true }));

    for (const [path, content] of testData.entries()) {
        await writeFile(path, content.text);
    }
}

export async function writeRandomFiles(count: number, ending: string): Promise<void> {
    // Make dir if it doesn't exist
    const dirPath = join(import.meta.dirname, './files/');
    existsSync(dirPath) || (await mkdir(dirPath, { recursive: true }));

    for (let i = 0; i < count; i++) {
        await writeFile(
            join(dirPath, `./${crypto.randomUUID()}.txt`),
            crypto.randomUUID() + ending + crypto.randomUUID()
        );
    }
}
export async function deleteTempFiles(): Promise<void> {
    for await (const path of glob(join(import.meta.dirname, './files/**/*.txt'))) {
        await unlink(path);
    }
}
