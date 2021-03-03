/**
 * Stop gulp process when ctrl+C is pressed
 */
module.exports = () => {
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.on('data', async data => {
    if (data.length === 1 && data[0] === 0x03) { // 0x03 is CTRL+c
      await new Promise(resolve => setTimeout(resolve, 400));
      console.log('Process exited !');
      process.exit(1);
    }
  });
}
