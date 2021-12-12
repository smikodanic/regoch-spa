/**
 * Stop gulp process when ctrl+C is pressed
 */
const rimraf = require('rimraf');

module.exports = async () => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', async data => {
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      await new Promise(resolve => setTimeout(resolve, 400));
      rimraf('./app/dist', async () => { });
      console.log('Removed /dist content.');
      process.exit(1);
    }
  });
}
