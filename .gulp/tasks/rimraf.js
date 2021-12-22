/**
 * Delete /app/_dist/ directory
 */
const rimraf = require('rimraf');

module.exports = async () => {

  rimraf('./app/_dist', async () => {
    // await new Promise(resolve => setTimeout(resolve, 2100));
    // console.log('👌  Folder "/app/_dist" deleted by rimraf');
  });

  rimraf('./app/_cache', async () => {});

  await new Promise(resolve => setTimeout(resolve, 1300));
};
