/**
 * Stop gulp process when ctrl+C is pressed
 */
const rimraf = require('rimraf');

module.exports = () => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', async data => {
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      rimraf('./app/dist', async () => { });
      rimraf('./app/cache', async () => { });
      console.log('Removed /dist & /cache folders.');
      await new Promise(resolve => setTimeout(resolve, 700));
      process.exit(1);
    }
  });
}
