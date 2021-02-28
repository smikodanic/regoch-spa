const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

module.exports = async () => {
  await gulp.src(['./app/src/index.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./app/dist/'));

  await gulp.src(['./app/src/html/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./app/dist/html/'));
};
