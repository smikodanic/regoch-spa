/**
 * Delete /client/_dist/ directory
 */
const rimraf = require('rimraf');

module.exports = async () => {

  rimraf('./client/_dist', async () => {
    // await new Promise(resolve => setTimeout(resolve, 2100));
    // console.log('👌  Folder "/client/_dist" deleted by rimraf');
  });

  rimraf('./client/_cache', async () => { });

  await new Promise(resolve => setTimeout(resolve, 1300));
};
