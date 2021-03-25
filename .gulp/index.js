const { task, watch, series, parallel } = require('gulp');

// tasks
const serverNode = require('./tasks/serverNode.js');
const rimraf = require('./tasks/rimraf.js');
const htmlMinify = require('./tasks/htmlMinify.js');
// const browserify = require('./tasks/browserify.js');
const browserifyMinifyMap = require('./tasks/browserifyMinifyMap.js');
const scss = require('./tasks/scss.js');
const compileViews = require('./tasks/compileViews.js');



/***** GULP BASIC TASKS *****/
task('serverStart', serverNode.start);
task('serverStop', serverNode.stop);
task('serverRestart', serverNode.restart);
task('rimraf', rimraf);
task('htmlMinify', htmlMinify);
task('browserifyMinifyMap', browserifyMinifyMap);
task('scss', scss);
task('compileViews', compileViews);


/***** WATCHERS *****/
task('watcher', async () => {
  await watch([
    'app/src/app.js',
    'app/src/controllers/**/*.js',
    'app/src/conf/*.js',
    'sys/**/*.js',
    '!sys/HTTPServer.js'
  ], series('browserifyMinifyMap'));

  await watch([
    'app/src/**/*.html'
  ], series('htmlMinify', 'compileViews', 'browserifyMinifyMap'));

  await watch([
    'regoch.json'
  ], series('compileViews'));

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
task('build', series('rimraf', parallel('browserifyMinifyMap', 'htmlMinify', 'compileViews', 'scss')));

// defult gulp task
task('default', parallel('watcher', 'build', 'serverStart'));
