const { task, watch, series, parallel } = require('gulp');

// tasks
const serverBuild = require('./tasks/serverBuild.js');
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
task('serverBuild', serverBuild);
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
  ], series('build'));

  await watch([
    'app/src/**/*.scss'
  ], series('build'));

  await watch([
    'app/src/*.js',
    'app/src/controllers/**/*.js',
    'app/src/conf/*.js',
    'app/src/lib/*.js',
    'sys/**/*.js',
    '!sys/HTTPServer.js'
  ], series('build'));

  await watch([
    'regoch.json'
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
// first delete then create JS, HTML and CSS files in /app/_dist/ directory
task('build', series('rimraf', 'serverBuild', parallel('htmlMinify', 'scss', 'browserifyMinifyMap', 'cacheViews', 'cacheEnv')));

// defult gulp task
task('default', series('watchers', 'build', 'serverStart'));

// remove /_dist content
onCtrlC();
