/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['src/__tests__/test-setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'dist/',
                'docs/',
                'coverage/',
                '**/*.d.ts',
                'node_modules/',
                'eslint.config.js',
                'vite.config.ts',
                'vitest.config.ts'
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
    },
});
