import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import { etaPlugin } from './src/plugins/eta-plugin.ts';

export default defineConfig(({ mode }) => {
    if (mode === 'lib') {
        return {
            plugins: [dts({
                outDirs: [
                    { dir: 'dist', moduleFormat: 'esm' },
                    { dir: 'dist', moduleFormat: 'cjs' }
                ],
                include: ['src/index.ts', 'src/patterns/**/*.ts', 'src/rendering/**/*.ts', 'src/utils/**/*.ts'],
            })],
            build: {
                target: 'es2020',
                copyPublicDir: false,
                minify: 'oxc',
                lib: {
                    entry: 'src/index.ts',
                    name: 'ASCIIGround',
                    formats: ['es', 'cjs', 'umd'],
                    fileName: (format) => format === 'cjs' ? 'asciiground.cjs' : `asciiground.${format}.js`,
                },
                rolldownOptions: {
                    output: { exports: 'named' },
                },
            },
        };
    }

    const isDemoBuild = mode === 'demo';

    return {
        root: 'src/demo',
        base: './',
        plugins: [etaPlugin({
            styles: isDemoBuild ? ['./demo.css'] : [],
            scripts: isDemoBuild ? ['./demo.js'] : ['./demo.ts'],
            isDev: !isDemoBuild,
        })],
        build: {
            outDir: '../../docs/demo',
            emptyOutDir: true,
            copyPublicDir: false,
            rolldownOptions: {
                input: {
                    main: resolve(import.meta.dirname, 'src/demo/index.eta'),
                    demo: resolve(import.meta.dirname, 'src/demo/demo.ts'),
                },
                output: {
                    entryFileNames: '[name].js',
                    assetFileNames: '[name][extname]',
                },
            },
        },
        server: { port: 3000, open: true },
        resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
    };
});
