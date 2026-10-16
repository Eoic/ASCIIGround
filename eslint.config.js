import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['**/*.ts', 'scripts/**/*.js', '**/*.mjs'],
        rules: {
            curly: ['error', 'multi-or-nest'],
            quotes: ['error', 'single'],
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            'max-len': ['error', 120],
            'semi': ['error', 'always'],
            'eol-last': ['error', 'always'],
            'comma-dangle': ['error', {
                'arrays': 'never',
                'objects': 'always-multiline',
                'imports': 'never',
                'exports': 'never',
                'functions': 'never'
            }],
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        ...tseslint.configs.disableTypeChecked,
        rules: {
            ...tseslint.configs.disableTypeChecked.rules,
            'no-undef': 'error',
        },
    },
    {
        files: ['scripts/release/*.mjs'],
        languageOptions: {
            globals: {
                fetch: 'readonly',
                AbortSignal: 'readonly',
            },
        },
    },
    {
        files: ['scripts/docs/version-selector.js'],
        languageOptions: {
            sourceType: 'script',
            globals: {
                console: 'readonly',
                document: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                window: 'readonly',
            },
        },
    },
);
