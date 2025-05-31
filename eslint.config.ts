import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    braceStyle: '1tbs',
    commaDangle: 'always-multiline',
    semi: true,
    jsx: true,
  }),
  {
    files: ['**/*.ts', '**/*.tsx', 'eslint.config.ts', 'vite.config.ts'],
    rules: {
      // Override ESLint Rules
      'no-prototype-builtins': 'off',

      // Override Stylistic Rules
      '@stylistic/arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      '@stylistic/jsx-curly-spacing': ['error', { when: 'never' }],
      '@stylistic/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      '@stylistic/no-trailing-spaces': ['error', { ignoreComments: true }],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/quote-props': 'off',

      // Override Typescript Plugin Rules
      '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
    },
  },
];
