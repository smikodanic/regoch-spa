const gulp = require('gulp');

/**
 * Copy /src/server.js to /dist/server.js
 */
module.exports = async () => {
  return gulp.src('./app/src/server.js').pipe(gulp.dest('./app/dist/'));
};
