const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const header = require('gulp-header');
const pkg = require('../../package.json');
const banner = require('./banner');



module.exports = async () => {


  return browserify('./client/src/app.js')
    .bundle()
    .pipe(source('app.js'))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('./client/_dist/js/'))
    .on('error', (err) => {
      console.log(err);
    });

};
