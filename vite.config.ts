import { defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { etaPlugin } from './src/plugins/eta-plugin.ts';

const config: Record<string, UserConfig> = {
    'demo': {
        root: 'src/demo',
        base: './',
        plugins: [
            etaPlugin({
                styles: [
                    './demo.css'
                ],
                scripts: [
                    './demo.js'
                ],
                isDev: false,
            })
        ],
        build: {
            outDir: '../../docs/demo',
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'src/demo/index.eta'),
                    demo: resolve(__dirname, 'src/demo/demo.ts'),
                },
                output: {
                    entryFileNames: '[name].js',
                    assetFileNames: '[name][extname]',
                    format: 'es',
                    sourcemap: false,
                },
            },
            copyPublicDir: false,
        },
    },
    'lib': {
        plugins: [
            dts({ 
                insertTypesEntry: true,
                exclude: [
                    'src/demo/**/*',
                    'src/plugins/**/*',
                    'src/__tests__/**/*',
                    'src/**/*.test.ts',
                    'src/**/*.spec.ts'
                ],
            })
        ],
        esbuild: {
            drop: ['console', 'debugger'],
            legalComments: 'none',
            minifyIdentifiers: true,
            minifySyntax: true,
            minifyWhitespace: true,
            treeShaking: true,
        },
        build: {
            lib: {
                entry: 'src/index.ts',
                name: 'ASCIIGround',
                fileName: (format) => `asciiground.${format}.js`,
            },
            minify: 'esbuild',
            target: 'es2020',
            sourcemap: false,
            assetsInlineLimit: 4096,
            cssCodeSplit: false,
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                external: [],
                output: [
                    {
                        format: 'es',
                        entryFileNames: 'asciiground.es.js',
                        globals: {},
                        exports: 'named',
                        preserveModules: false,
                        manualChunks: undefined,
                    },
                    {
                        format: 'umd',
                        name: 'ASCIIGround',
                        entryFileNames: 'asciiground.umd.js',
                        globals: {},
                        exports: 'named',
                        compact: true,
                    }
                ],
                treeshake: {
                    moduleSideEffects: false,
                    propertyReadSideEffects: false,
                    tryCatchDeoptimization: false,
                },
                onwarn(warning, warn) {
                    if (warning.code === 'CIRCULAR_DEPENDENCY')
                        return;

                    warn(warning);
                },
            },
        },
    },
    'default': {
        root: 'src/demo',
        base: './',
        plugins: [
            etaPlugin({
                styles: [],
                scripts: ['./demo.ts'],
                isDev: true,
            })
        ],
        build: {
            rollupOptions: {
                input: {
                    demo: resolve(__dirname, 'src/demo/demo.ts'),
                },
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
    },
};

export default defineConfig(({ mode }) => {
    if (Object.keys(config).includes(mode))
        return config[mode];

    return config['default'];
});
