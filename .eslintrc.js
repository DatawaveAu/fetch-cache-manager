module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018,
    },
    overrides: [
        {
            files: '*',
            rules: {
                quotes: ['error', 'single', { avoidEscape: true }],
                'computed-property-spacing': ['error', 'never'],
                'object-curly-spacing': ['error', 'always'],
                'array-bracket-spacing': ['error', 'always'],
                semi: ['error', 'always'],
                'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1, 'maxBOF': 0 }],
                'eol-last': ['error', 'always'],
                'max-len': ['error', { 'code': 140 }]
            }
        }
    ]
};
