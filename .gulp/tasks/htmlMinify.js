const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

module.exports = async () => {


  return gulp
    .src([
      './client/src/html/*.html'
    ])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./client/dist/html/'));

};
