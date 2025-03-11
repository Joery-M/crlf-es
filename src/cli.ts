import { glob } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from 'node:process';
import { parseArgs, styleText } from 'node:util';
import { getFileLineEndings } from '.';
import { transformFile } from './transform-file';
import { asyncIterToArray, getEndingString } from './utils';

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
    const maxLineLength = Math.max(...files.map((v) => join(process.cwd(), v).length));

    function logFile(type: 'skipped' | 'success' | 'error', filePath: string, start: number) {
        const duration = Math.round(Math.max(performance.now() - start, 0)).toLocaleString(
            'en-US',
            {
                style: 'unit',
                unit: 'millisecond'
            }
        );
        const formattedFilePath = join(process.cwd(), filePath).replaceAll('\\', '/');
        const durationStr = `${' '.repeat(maxLineLength - formattedFilePath.length)} (${duration})`;

        switch (type) {
            case 'skipped':
                console.log(
                    isColorSupported
                        ? styleText(['black', 'bgYellow'], ' SKIPPED ')
                        : '[ SKIPPED ]',
                    formattedFilePath,
                    durationStr
                );
                break;
            case 'success':
                console.log(
                    isColorSupported
                        ? styleText(['black', 'bgGreenBright'], ' SUCCESS ')
                        : '[ SUCCESS ]',
                    formattedFilePath,
                    durationStr
                );
                break;
            case 'error':
                console.error(
                    isColorSupported ? styleText('bgRedBright', '  ERROR  ') : '[  ERROR  ]',
                    formattedFilePath,
                    durationStr
                );
                break;
            default:
                break;
        }
    }

    // Empty line
    console.log('');

    const transforms$ = files.map(async (filePath) => {
        const start = performance.now();
        const currentEnding = await getFileLineEndings(filePath);
        if (!setNew) {
            // Read only
            const formattedFilePath = join(process.cwd(), filePath).replaceAll('\\', '/');
            const endingStr = `${' '.repeat(maxLineLength - formattedFilePath.length)} ${currentEnding ?? 'None'}`;
            const color =
                currentEnding == null ? 'grey' : currentEnding === 'CRLF' ? 'blue' : 'green';
            console.log(formattedFilePath, styleText(color, endingStr));
            return;
        }

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

    await Promise.allSettled(transforms$);

    const duration = Math.round(performance.now()).toLocaleString('en-US', {
        style: 'unit',
        unit: 'millisecond'
    });
    console.log('\n' + styleText('green', 'Done in ' + duration));
})();
