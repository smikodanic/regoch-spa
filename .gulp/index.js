const { task, watch, series, parallel } = require('gulp');

// tasks
const serverNode = require('./tasks/serverNode.js');
const rimraf = require('./tasks/rimraf.js');
const htmlMinify = require('./tasks/htmlMinify.js');
// const browserify = require('./tasks/browserify.js');
const browserifyMinifyMap = require('./tasks/browserifyMinifyMap.js');
const scss = require('./tasks/scss.js');
const cacheViews = require('./tasks/cacheViews.js');
const cacheEnv = require('./tasks/cacheEnv.js');



/***** GULP BASIC TASKS *****/
task('serverStart', serverNode.start);
task('serverStop', serverNode.stop);
task('serverRestart', serverNode.restart);
task('rimraf', rimraf);
task('htmlMinify', htmlMinify);
task('browserifyMinifyMap', browserifyMinifyMap);
task('scss', scss);
task('cacheViews', cacheViews);
task('cacheEnv', cacheEnv);


/***** WATCHERS *****/
task('watchers', async () => {
  await watch([
    'app/src/**/*.html'
  ], series('htmlMinify', 'cacheViews', 'browserifyMinifyMap'));

  await watch([
    'app/src/**/*.scss'
  ], series('scss'));

  await watch([
    'app/src/*.js',
    'app/src/controllers/**/*.js',
    'app/src/conf/*.js',
    'app/src/lib/*.js',
    'sys/**/*.js',
    '!sys/HTTPServer.js'
  ], series('browserifyMinifyMap'));

  await watch([
    'regoch.json'
  ], series('cacheViews','cacheEnv', 'browserifyMinifyMap', 'serverRestart'));

  await watch([
    'env/*.js'
  ], series('cacheEnv', 'browserifyMinifyMap'));

  await watch([
    'sys/HTTPServer.js',
    'server.js'
  ], series('serverRestart'));
});


/***** GULP COMPOUND TASKS *****/
// first delete then create JS, HTML and CSS files in /app/dist/ directory
task('build', series('rimraf', parallel('htmlMinify', 'scss', 'browserifyMinifyMap', 'cacheViews', 'cacheEnv')));

// defult gulp task
task('default', parallel('watchers', 'build', 'serverStart'));
