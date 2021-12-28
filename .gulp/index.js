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
const onCtrlC = require('./tasks/onCtrlC.js');



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
    'client/src/**/*.html'
  ], series('build'));

  await watch([
    'client/src/**/*.scss'
  ], series('build'));

  await watch([
    'client/src/*.js',
    'client/src/controllers/**/*.js',
    'client/src/conf/*.js',
    'client/src/lib/*.js',
    'sys/**/*.js',
    '!sys/HTTPServer.js'
  ], series('build'));

  await watch([
    '/client/regoch.json'
  ], series('cacheViews', 'cacheEnv', 'browserifyMinifyMap', 'serverRestart'));

  await watch([
    'env/*.js'
  ], series('cacheEnv', 'browserifyMinifyMap'));

  await watch([
    'sys/HTTPServer.js',
    'server.js'
  ], series('serverRestart'));
});


/***** GULP COMPOUND TASKS *****/
// first delete then create JS, HTML and CSS files in /client/_dist/ directory
task('build', series('rimraf', parallel('htmlMinify', 'scss', 'browserifyMinifyMap', 'cacheViews', 'cacheEnv')));

// defult gulp task
task('default', series('watchers', 'build', 'serverStart'));

// remove /_dist content
onCtrlC();
