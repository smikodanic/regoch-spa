const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

module.exports = async () => {
  await gulp.src(['./client/src/application/index.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./client/dist/'));

  await gulp.src(['./client/src/application/html/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./client/dist/html/'));
};
