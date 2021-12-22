const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

module.exports = async () => {
  await gulp.src(['./app/src/views/**/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./app/_dist/views/'));
};
