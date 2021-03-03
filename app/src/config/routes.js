const Page1Ctrl = require('./controllers/Page1Ctrl');
const Page2Ctrl = require('./controllers/Page2Ctrl');


/**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {Class} Ctrl - route controller function
   * @param {string} viewPath - view path, for example: '/pages/page1/page1.html'
   * @returns{Promise<void>}
   */
module.exports = async (system) => {
  system.route('/page1.html', '/pages/page1/page1.html', Page1Ctrl);
  system.route('/page2.html', '/pages/page2/page2.html', Page2Ctrl);
};
