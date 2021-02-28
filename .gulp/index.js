const { task, watch, series, parallel } = require('gulp');

// tasks
const serverNodemon = require('./tasks/serverNodemon.js');
// const serverPm2 = require('./tasks/serverPm2.js');
// const serverNode = require('./tasks/serverNode.js');
const rimraf = require('./tasks/rimraf.js');
const htmlMinify = require('./tasks/htmlMinify.js');
// const browserify = require('./tasks/browserify.js');
const browserifyMinifyMap = require('./tasks/browserifyMinifyMap.js');
const scss = require('./tasks/scss.js');


/***** GULP BASIC TASKS *****/
task('serverNodemon', serverNodemon);
task('rimraf', rimraf);
task('htmlMinify', htmlMinify);
task('browserifyMinifyMap', browserifyMinifyMap);
task('scss', scss);


/***** WATCHERS *****/
task('watcher', async () => {
  await watch([
    'app/src/**/*.js',
    'sys/**/*.js'
  ], series('browserifyMinifyMap'));

  await watch([
    'app/src/**/*.html'
  ], series('htmlMinify'));

  await watch([
    'app/src/**/*.scss'
  ], series('scss'));
});


/***** GULP COMPOUND TASKS *****/
// first delete then create JS, HTML and CSS files in /app/dist/ directory
task('build', series('rimraf', parallel('browserifyMinifyMap', 'htmlMinify', 'scss')));

// defult gulp task
task('default', parallel('watcher', 'build', 'serverNodemon'));
