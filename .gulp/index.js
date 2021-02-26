const { task, watch, series, parallel } = require('gulp');

// tasks
const serverNodemon = require('./tasks/serverNodemon.js');
// const serverPm2 = require('./tasks/serverPm2.js');
// const serverNode = require('./tasks/serverNode.js');
const rimraf = require('./tasks/rimraf.js');
const htmlMinify = require('./tasks/htmlMinify.js');
const browserify = require('./tasks/browserify.js');
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
    'client/src/**/*.js'
  ], series('browserifyMinifyMap')),

  await watch([
    'client/src/**/*.html'
  ], series('htmlMinify')),

  await watch([
    'client/src/**/*.scss'
  ], series('scss'))
});




/***** GULP COMPOUND TASKS *****/
// first delete then create JS, HTML and CSS files in /client/dist/ directory
task('build', async () => {
  await series(rimraf);
  await new Promise(resolve => setTimeout(resolve, 1300));
  await parallel(
  'browserifyMinifyMap',
  'htmlMinify',
  'scss'
  );
});

// defult gulp task
task('default', async () => {

  await watch([
    'client/src/**/*.js'
  ], { events: 'all' }, series('browserifyMinifyMap'));

  await watch([
    'client/src/**/*.html'
  ], { events: 'all' }, series('htmlMinify'));

  await watch([
    'client/src/**/*.scss'
  ], { events: 'all' }, series('scss'));

  await series('build');
  await new Promise(resolve => setTimeout(resolve, 700));
  await series('serverNodemon');
});
