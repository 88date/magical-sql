'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  ...init,
  {
    files: ['application/**/*.js'],
    rules: {
      'arrow-body-style': 'off',
      'max-len': [
        'error',
        {
          code: 80,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      strict: 'off',
    },
  },
];
