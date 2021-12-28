const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

module.exports = async () => {
  await gulp.src(['./client/src/views/**/*.html'])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./client/_dist/views/'));
};
