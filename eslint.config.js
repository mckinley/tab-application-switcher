import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
        chrome: 'readonly'
      }
    },
    rules: {
      // Modern JS
      'no-var': 'error',
      'prefer-const': 'error',

      // No semicolons
      semi: ['error', 'never'],

      // Allow unused vars prefixed with _
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: ['dist/**', 'package/**', 'node_modules/**']
  }
]
