module.exports = {
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'max-params': ['error', 6],
    'max-lines': ['error', { max: 1500, skipBlankLines: true, skipComments: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-native/no-inline-styles': 'off',
    'prettier/prettier': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
