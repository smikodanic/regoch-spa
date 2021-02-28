/**
 * Delete /app/dist/ directory
 */
const rimraf = require('rimraf');

module.exports = async () => {

  rimraf('./app/dist', () => {
    console.log('/app/dist deleted by rimraf');
  });

  await new Promise(resolve => setTimeout(resolve, 1300));
};
