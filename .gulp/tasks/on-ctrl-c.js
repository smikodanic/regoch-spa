module.exports = (gulp) => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', data => {
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      gulp.start('pm2-stop', () => {
        console.log('\nExiting ... Please wait.\n');
        setTimeout(() => {
          process.exit(); // exiting gulp
        }, 3400);
      });
    }
  });
};
