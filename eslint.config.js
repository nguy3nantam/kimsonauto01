import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'server/data/**', 'server/uploads/**', 'backups/**'] },
  { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, 'react-hooks': hooks }, settings: { react: { version: 'detect' } },
    rules: { ...js.configs.recommended.rules, 'no-unused-vars': 'off', 'react/jsx-uses-vars': 'error', 'react/jsx-uses-react': 'error', 'react-hooks/rules-of-hooks': 'error', 'no-empty': ['error', { allowEmptyCatch: true }] } }
];
