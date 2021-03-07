const RegochRouter = require('regoch-router');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {Class} Ctrl - route controller class
   * @returns {void}
   */
  when(route, Ctrl) {
    const ctrl = new Ctrl();
    if (!route) { throw new Error(`Route is not defined for ${Ctrl.name} controller.`); }

    // controller methods
    const render = ctrl.render.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.def(route, render, init);
  }


  /**
   * Define 404 not found route
   * @param {Class} Ctrl - route controller class
   * @returns {void}
   */
  notFound (Ctrl) {
    const ctrl = new Ctrl();

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
      .catch(err => console.log('ERRrouter:: ', err));
  }



}





module.exports = Router;
