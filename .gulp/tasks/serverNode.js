const gulp = require('gulp');
const exec = require('child_process').exec;


module.exports = (config) => {
  const app_name = config.app_name.replace(/\s/g, '-');

  console.log('Application name: ' + app_name);

  gulp.task('node-start', () => {
    exec('node server', (err, stdout) => {
      if (err) {
        console.log(err);
      } else {
         console.log('SERVER STARTED with: node start');
        console.log(stdout);
      }
    });
  });

  gulp.task('node-stop', () => {
    console.log('SERVER STOPPED');
    process.exit();
  });

  gulp.task('node-restart', ['node-stop', 'node-start'], () => {
    console.log('SERVER RESTARTED');
  });

};
