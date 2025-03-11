import { defineConfig } from 'rolldown';
import IsolatedDecl from 'unplugin-isolated-decl/rolldown';

const external = [/^node:/];
const minify = {
    deadCodeElimination: true,
    compress: true,
    mangle: false,
    removeWhitespace: false
} as any;

export default defineConfig([
    {
        input: './src/index.ts',
        platform: 'node',
        external,
        treeshake: true,
        plugins: [IsolatedDecl()],
        output: {
            minify
        }
    },
    {
        input: './src/cli.ts',
        platform: 'node',
        external,
        treeshake: true,
        output: {
            banner: '#!/usr/bin/env node',
            dir: './bin/',
            entryFileNames: 'crlf-es.mjs',
            format: 'esm',
            minify
        }
    }
]);
