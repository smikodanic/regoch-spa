/**
 * - browserify
 * - creates minified JS file
 * - creates JS map file
 */
const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const minify = require('gulp-minify');
const sourcemaps = require('gulp-sourcemaps');


module.exports = async () => {
  browserify('./client/src/main.js')
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(minify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./client/dist/js'))
    .on('error', (err) => {
      console.log(err.message);
    });
};
