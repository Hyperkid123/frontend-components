const path = require('path');
const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = path.resolve(__dirname, './packages/eslint-config/lib/rules');

module.exports = {
  plugins: ['rulesdir', 'import'],
  extends: path.resolve(__dirname, './packages/eslint-config/index.js'),
  globals: {
    insights: 'readonly',
  },
  rules: {
    'no-prototype-builtins': 'off',
    'import/prefer-default-export': ['error'],
    'sort-imports': [
      2,
      {
        ignoreDeclarationSort: true,
      },
    ],
    'react/no-unknown-property': ['error', { ignore: ['widget-type', 'widget-id', 'page-type', 'ouiaId'] }],
  },
  overrides: [
    {
      files: ['packages/**/src/**/*.ts', 'packages/**/src/**/*.tsx', 'packages/types/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'react/prop-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      },
    },
    {
      files: [
        'packages/pdf-generator/src/**/*.js',
        'packages/**/src/**/*__mock__*/**/*.js',
        'packages/**/src/**/*__mocks__*/**/*.js',
        'packages/create-crc-app/**/*.js',
      ],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
  ],
};
