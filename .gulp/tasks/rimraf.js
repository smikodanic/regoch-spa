/**
 * Delete /app/dist/ directory
 */
const rimraf = require('rimraf');

module.exports = async () => {

  rimraf('./app/dist', async () => {
    await new Promise(resolve => setTimeout(resolve, 2100));
    console.log('👌  Folder "/app/dist" deleted by rimraf');
  });

  await new Promise(resolve => setTimeout(resolve, 1300));
};
