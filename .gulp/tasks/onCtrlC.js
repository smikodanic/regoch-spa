/**
 * Stop gulp process when ctrl+C is pressed
 */
const rimraf = require('rimraf');
const serverNode = require('./serverNode');

module.exports = () => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', async data => {
    await new Promise(r => setTimeout(r, 1300));
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      // await rimraf('./client/_dist', async () => { });
      // await rimraf('./client/_cache', async () => { });
      // console.log('\n💥  Removed /_dist & /_cache folders after Ctrl+C.');

      await new Promise(resolve => setTimeout(resolve, 400));
      serverNode.stop();
      console.log('💥  The "node server" process is killed after Ctrl+C');

      await new Promise(resolve => setTimeout(resolve, 400));
      process.exit();

    } else if (data.length === 1 && data[0] === 0x0d) { // 0x0d is Enter
      console.log('☺'); // https://unicode.org/emoji/charts/full-emoji-list.html
    }
  });
}
