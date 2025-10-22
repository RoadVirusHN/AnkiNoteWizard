module.exports = {
  parser: '@typescript-eslint/parser', // TypeScript 문법 해석
  parserOptions: {
    ecmaVersion: 2020, // 최신 ECMAScript 문법 지원
    sourceType: 'module', // import/export 사용
  },
  plugins: ['@typescript-eslint'], // TS용 규칙 모음
  env: {
    browser: true, // window, document 등 인식
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended' // 추가
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['warn', 'single'],
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        printWidth: 100,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
  },
  
};
