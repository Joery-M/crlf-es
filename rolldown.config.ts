import { defineConfig } from 'rolldown';
import { dependencies } from './package.json' with { type: 'json' };
import IsolatedDecl from 'unplugin-isolated-decl/rolldown';

const external = ['fs', /^node:/, 'path', ...Object.keys(dependencies)];
export default defineConfig([
    {
        input: './src/index.ts',
        platform: 'node',
        external,
        treeshake: true,
        plugins: [IsolatedDecl()],
        output: {
            minify: true,
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
            minify: true,
            entryFileNames: 'crlf-es.mjs',
            format: 'esm'
        }
    }
]);
