module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'eslint-config-airbnb-base',
    'plugin:security/recommended',
  ],
  plugins: [
    'security',
  ],
  rules: {
    'max-len': 'off',
    'no-underscore-dangle': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': ['error', 'always', {
      js: 'never',
    }],
    'arrow-parens': ['error', 'always'],
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
