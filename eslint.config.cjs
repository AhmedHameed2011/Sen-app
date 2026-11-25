const globals = require('globals');

module.exports = [
  {
    files: ['js/**/*.js', 'functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {},
  },
];