/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['src/__tests__/test-setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'dist/',
                'docs/',
                'coverage/',
                'src/plugins/',
                '**/*.d.ts',
                'node_modules/',
                'eslint.config.js',
                'vite.config.ts',
                'vitest.config.ts'
            ],
            thresholds: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        },
    },
});
