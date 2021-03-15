const RegochRouter = require('regoch-router');
const eventEmitter = require('./eventEmitter');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} Ctrl - route controller instance
   * @returns {void}
   */
  when(route, ctrl) {
    if (!route) { throw new Error(`Route is not defined for ${ctrl.constructor.name} controller.`); }

    // controller methods
    const render = ctrl.render.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.def(route, render, init);
  }


  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  notFound(ctrl) {
    // controller methods
    const render = ctrl.render.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.notfound(render, init);
  }


  /**
   * Match routes against current browser URI.
   * @param {string} uri - browser's address bar URI
   * @returns {void}
   */
  testRoutes(uri) {
    this.regochRouter.trx = { uri };
    this.regochRouter.exe()
      // .then(trx => console.log('Route executed trx:: ', trx))
      .catch(err => console.error('ERRrouter:: ', err));
  }


  use() {
    // test URI against routes when browser's Reload button is clicked
    const uri = window.location.pathname + window.location.search; // /page1.html?q=12
    this.testRoutes(uri);

    // test URI against routes when element with data-rg-hrf attribute is clicked
    eventEmitter.on('pushstate', event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log(uri, event.detail.href);
      this.testRoutes(uri);
    });
  }



}





module.exports = new Router();
