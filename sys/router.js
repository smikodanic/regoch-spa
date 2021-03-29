const RegochRouter = require('regoch-router');
const eventEmitter = require('./eventEmitter');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  when(route, ctrl) {
    if (!route) { throw new Error(`Route is not defined for ${ctrl.constructor.name} controller.`); }

    // controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.def(route, prerender, render, postrender, init);
  }


  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  notfound(ctrl) {
    // controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.notfound(prerender, render, postrender, init);
  }



  /**
   * Define functions which will be executed on every route.
   * @param {Function[]} funcs - function which will be executed on every request, e.g. every exe()
   * @returns {Router}
   */
  do(...funcs) {
    this.regochRouter.do(...funcs);
  }


  /**
   * Redirect from one route to another route.
   * @param {string} fromRoute - new route
   * @param {string} toRoute - destination route (where to redirect)
   * @returns {Router}
   */
  redirect(fromRoute, toRoute) {
    this.regochRouter.redirect(fromRoute, toRoute);
  }



  /**
   * Execute all defined routes.
   */
  use() {
    // test URI against routes when browser's Reload button is clicked
    const uri = window.location.pathname + window.location.search; // /page1.html?q=12
    this._testRoutes(uri);

    // test URI against routes when element with data-rg-hrf attribute is clicked
    eventEmitter.on('pushstate', event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log(uri, event.detail.href);
      this._testRoutes(uri);
    });
  }


  /**
   * Match routes against current browser URI.
   * @param {string} uri - browser's address bar URI
   * @returns {void}
   */
  _testRoutes(uri) {
    this.regochRouter.trx = { uri };
    this.regochRouter.exe()
      // .then(trx => console.log('Route executed trx:: ', trx))
      .catch(err => console.error('ERRrouter:: ', err));
  }



}





module.exports = new Router();
