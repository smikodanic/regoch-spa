const nodemon = require('gulp-nodemon');

module.exports = async () => {
  nodemon({
    script: 'server.js',
    ext: 'js json html',
    ignore: [
      'README.md',
      'LICENSE',
      'package.json',
      'node_modules/**',
      'client/**',
      '.gulp/**',
      '.*/**'
    ],
    delayTime: 10,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  }).on('restart', ['']);
};
