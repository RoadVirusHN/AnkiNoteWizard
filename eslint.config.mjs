// eslint.config.mjs
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

/** @type {import('eslint').FlatConfig.Config[]} */
export default [
  // React용 설정
  {
    files: ['**/*.{js,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
  },
  // React Hooks용 설정
  {
    files: ['**/*.{js,jsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  // TypeScript용 설정
  {
    files: ['**/*.{ts,tsx}'], 
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: pluginPrettier,
    },
    settings:{
      react: {
        version: 'detect', // React 버전을 자동으로 감지
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      semi: ['error', 'always'],
      quotes: ['warn', 'single'],
      'prettier/prettier': ['warn'],
      'no-unused-vars': 'off', // TypeScript에서 사용하지 않는 변수는 @typescript-eslint/no-unused-vars로 처리
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }], // 사용하지 않는 변수는 경고, 단 '_'로 시작하는 변수는 무시
    },
  },

  // WARN : Prettier 충돌 방지 (항상 마지막에!)
  prettier,
];
