import { glob } from 'node:fs/promises';
import { relative } from 'node:path';
import { env } from 'node:process';
import { parseArgs, styleText } from 'node:util';
import { getFileLineEndings } from '.';
import { transformFile } from './transform-file';
import { asyncIterToArray, existsAsync, getEndingString } from './utils';

const args = parseArgs({
    options: {
        force: {
            type: 'boolean',
            default: false,
            short: 'f'
        },
        set: {
            type: 'string',
            short: 's'
        },
        'no-color': { type: 'boolean' },
        color: { type: 'boolean' },
        help: {
            type: 'boolean',
            short: 'h'
        }
    },
    allowPositionals: true
});

const isColorSupported =
    !(!!env.NO_COLOR || args.values['no-color']) &&
    (!!env.FORCE_COLOR ||
        args.values.color ||
        process.platform === 'win32' ||
        ((process.stdout || {}).isTTY && env.TERM !== 'dumb') ||
        !!env.CI);

if (args.values.help || args.positionals.length === 0) {
    console.log('');
    console.log(
        styleText(['white', 'bold', 'underline'], 'USAGE'),
        styleText('cyan', 'crlf-es ./files/**/*.txt --set CRLF'),
        'or',
        styleText('cyan', 'crlf-es <input> <options>')
    );
    console.log('');
    console.log(styleText(['white', 'bold', 'underline'], 'OPTIONS'));
    console.log('');
    console.log('  ', styleText('cyan', '--help -h'), '\t\t', 'This help message.');
    console.log(
        '  ',
        styleText('cyan', '--force -f, <bool>'),
        '\t',
        'Force conversion, even if file already has the same line endings.'
    );
    console.log(
        '  ',
        styleText('cyan', '--set -s, <CRLF|LF>'),
        '\t',
        'Line endings to set the files to.'
    );

    process.exit(0);
}

const ending = args.values.set?.toUpperCase();
const setNew = !!ending;
if (ending && ending != 'CRLF' && ending != 'LF') {
    console.error(
        '\n' + (isColorSupported ? styleText('bgRedBright', ' ERROR ') : '[ ERROR ]'),
        styleText('reset', '--set is required to be either CRLF or LF\n')
    );
    process.exit(1);
}

const newEnding = getEndingString(ending);

(async () => {
    const files = await asyncIterToArray(glob(args.positionals));
    const maxLineLength = Math.min(
        Math.max(...files.map((v) => relative(process.cwd(), v).length)),
        process.stdout.columns - 6
    );

    function formatFilePath(filePath: string, padding = 0) {
        let str = relative(process.cwd(), filePath).replaceAll('\\', '/');
        if (str.length > process.stdout.columns - padding - 1) {
            str = '...' + str.slice(-process.stdout.columns + padding + 4);
        }
        return str;
    }

    function logFile(
        type: 'skipped' | 'success' | 'error',
        filePath: string,
        start: number,
        reason?: string
    ) {
        const duration =
            ' (' +
            Math.round(Math.max(performance.now() - start, 0)).toLocaleString('en-US', {
                style: 'unit',
                unit: 'millisecond'
            }) +
            ')';

        let tag = '';
        const tagLength = isColorSupported ? 9 : 11;
        switch (type) {
            case 'skipped':
                tag = isColorSupported
                    ? styleText(['black', 'bgYellow'], ' SKIPPED ')
                    : '[ SKIPPED ]';
                break;
            case 'success':
                tag = isColorSupported
                    ? styleText(['black', 'bgGreenBright'], ' SUCCESS ')
                    : '[ SUCCESS ]';
                break;
            case 'error':
                tag = isColorSupported ? styleText('bgRedBright', '  ERROR  ') : '[  ERROR  ]';
                break;
            default:
                break;
        }

        const formattedFilePath = formatFilePath(filePath, tagLength + duration.length + 1);
        console.log(
            tag,
            formattedFilePath.padEnd(
                Math.min(maxLineLength, process.stdout.columns - tagLength - duration.length - 2),
                ' '
            ),
            styleText('gray', duration)
        );
        if (reason) {
            console.log(' '.repeat(tagLength), styleText('gray', '└─ ' + reason));
        }
    }

    // Empty line
    console.log('');

    let finishedTransforms = 0;
    let fileCount = 0;
    const transforms$ = files.map(async (filePath) => {
        const start = performance.now();
        const exists = await existsAsync(filePath);
        if (exists != 'file') return;
        fileCount++;

        const currentEnding = await getFileLineEndings(filePath);
        if (!setNew) {
            // Read only
            const formattedFilePath = formatFilePath(filePath, 6);
            const ending = currentEnding ?? 'None';
            const endingStr = `${' '.repeat(Math.max(0, maxLineLength - formattedFilePath.length + (4 - ending.length)))} ${ending}`;
            const color =
                currentEnding == null ? 'grey' : currentEnding === 'CRLF' ? 'blue' : 'green';
            console.log(formattedFilePath, styleText(color, endingStr));
            finishedTransforms++;
            return;
        }

        if (currentEnding == null) {
            logFile('skipped', filePath, start, 'No line endings found');
            return;
        }
        if (currentEnding === ending && !args.values.force) {
            logFile('skipped', filePath, start, 'Line endings are the same');
            return;
        }
        const curEndingString = getEndingString(currentEnding);

        try {
            await transformFile(filePath, (chunk) => {
                return chunk?.toString().replaceAll(curEndingString, newEnding);
            });
            finishedTransforms++;
            logFile('success', filePath, start);
        } catch (error) {
            logFile('error', filePath, start);
            console.error(error);
        }
    });

    await Promise.all(transforms$).finally(() => {
        const duration = Math.round(performance.now()).toLocaleString('en-US', {
            style: 'unit',
            unit: 'millisecond'
        });
        console.log(
            '\n' +
                styleText(
                    'green',
                    `${finishedTransforms}/${fileCount} files ${setNew ? 'transformed' : 'read'} in ${duration}`
                )
        );
    });
})();
