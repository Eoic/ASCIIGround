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
        files: ['**/*.js'],
        ...tseslint.configs.disableTypeChecked,
    },
);