import { parseArgs } from 'node:util';
import { relative } from 'pathe';
import {
    bgBlackBright,
    bgGreenBright,
    bgRedBright,
    black,
    isColorSupported,
    reset
} from 'picocolors';
import { globSync } from 'tinyglobby';
import { getFileLineEndings } from '.';
import { transformFile } from './transform-file';
import { getEndingString } from './utils';

const args = parseArgs({
    options: {
        force: {
            type: 'boolean',
            default: false,
            short: 'f'
        },
        set: {
            type: 'string',
            default: '',
            short: 's'
        },
        // For picocolors
        'no-color': {
            type: 'boolean',
            default: false
        },
        color: {
            type: 'boolean',
            default: true
        }
    },
    allowPositionals: true
});

const ending = args.values.set?.toUpperCase();
if (ending == null || (ending != 'CRLF' && ending != 'LF')) {
    console.error(
        '\n' + (isColorSupported ? bgRedBright(' ERROR ') : '[ ERROR ]'),
        reset('--set is required to be either CRLF or LF\n')
    );
    process.exit(1);
}

const files = globSync(args.positionals, {
    onlyFiles: true
});
const maxLineLength = Math.max(...files.map((v) => relative(process.cwd(), v).length));

const newEnding = getEndingString(ending);

function logFile(type: 'skipped' | 'success' | 'error', filePath: string, start: number) {
    const duration = Math.round(Math.max(performance.now() - start, 0)).toLocaleString('en-US', {
        style: 'unit',
        unit: 'millisecond'
    });
    const formattedFilePath = relative(process.cwd(), filePath);
    const durationStr = `${' '.repeat(maxLineLength - formattedFilePath.length)} (${duration})`;

    switch (type) {
        case 'skipped':
            console.log(
                isColorSupported ? bgBlackBright(' SKIPPED ') : '[ SKIPPED ]',
                formattedFilePath,
                durationStr
            );
            break;
        case 'success':
            console.log(
                isColorSupported ? black(bgGreenBright(' SUCCESS ')) : '[ SUCCESS ]',
                formattedFilePath,
                durationStr
            );
            break;
        case 'error':
            console.error(
                isColorSupported ? bgRedBright('  ERROR  ') : '[  ERROR  ]',
                formattedFilePath,
                durationStr
            );
            break;
        default:
            break;
    }
}

const transforms$ = files.map(async (filePath) => {
    const start = performance.now();
    const currentEnding = await getFileLineEndings(filePath);
    if ((currentEnding === ending && !args.values.force) || currentEnding == null) {
        logFile('skipped', filePath, start);
        return;
    }
    const curEndingString = getEndingString(currentEnding);

    try {
        await transformFile(filePath, (chunk) => {
            return chunk?.toString().replaceAll(curEndingString, newEnding);
        });
        logFile('success', filePath, start);
    } catch (error) {
        logFile('error', filePath, start);
        console.error(error);
    }
});

(async () => {
    await Promise.allSettled(transforms$);
})();
