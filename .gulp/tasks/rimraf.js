/**
 * Delete /client/dist/ directory
 */
const rimraf = require('rimraf');

module.exports = async () => {

  rimraf('./client/dist', () => {
    console.log('/client/dist deleted by rimraf');
  });
};
