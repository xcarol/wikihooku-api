module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    mocha: true,
  },
  extends: [
    'eslint-config-airbnb-base',
    'plugin:security/recommended',
  ],
  plugins: [
    'mocha',
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
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-identical-title': 'error',
    'mocha/valid-test-description': ['warn', '^(?!should).*$', ['it', 'specify', 'test']],
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
