/**
 * Stop gulp process when ctrl+C is pressed
 */
const rimraf = require('rimraf');

module.exports = () => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', async data => {
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      rimraf('./app/_dist', async () => { });
      rimraf('./app/_cache', async () => { });
      console.log('Removed /_dist & /_cache folders.');
      await new Promise(resolve => setTimeout(resolve, 700));
      process.exit(1);
    }
  });
}
