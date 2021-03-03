const { task, watch, series, parallel } = require('gulp');

// tasks
const serverNode = require('./tasks/serverNode.js');
const rimraf = require('./tasks/rimraf.js');
const htmlMinify = require('./tasks/htmlMinify.js');
// const browserify = require('./tasks/browserify.js');
const browserifyMinifyMap = require('./tasks/browserifyMinifyMap.js');
const scss = require('./tasks/scss.js');



/***** GULP BASIC TASKS *****/
task('serverStart', serverNode.start);
task('serverStop', serverNode.stop);
task('serverRestart', serverNode.restart);
task('rimraf', rimraf);
task('htmlMinify', htmlMinify);
task('browserifyMinifyMap', browserifyMinifyMap);
task('scss', scss);


/***** WATCHERS *****/
task('watcher', async () => {
  await watch([
    'app/src/**/*.js',
    'sys/**/*.js',
    '!sys/HTTPServer.js'
  ], series('browserifyMinifyMap'));

  await watch([
    'app/src/**/*.html'
  ], series('htmlMinify'));

  await watch([
    'app/src/**/*.scss'
  ], series('scss'));

  await watch([
    'sys/HTTPServer.js',
    'server.js'
  ], series('serverRestart'));
});


/***** GULP COMPOUND TASKS *****/
// first delete then create JS, HTML and CSS files in /app/dist/ directory
task('build', series('rimraf', parallel('browserifyMinifyMap', 'htmlMinify', 'scss')));

// defult gulp task
task('default', parallel('watcher', 'build', 'serverStart'));
