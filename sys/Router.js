const RegochRouter = require('regoch-router');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {Class} Ctrl - route function
   * @returns {void}
   */
  when(route, Ctrl) {
    const controller = new Ctrl();
    if (!route) { throw new Error(`Route is not defined for ${Ctrl.name} controller.`); }

    // controller methods
    const reset = controller.reset.bind(controller);
    const init = controller.init.bind(controller);
    const parse = controller.parse.bind(controller, Ctrl);
    const load = controller.load.bind(controller);

    this.regochRouter.def(route, reset, init, parse, load);
  }


  /**
   * Define 404 not found route
   * @param {Class} Ctrl - route function
   * @returns {void}
   */
  notFound (Ctrl) {
    const controller = new Ctrl();

    // controller methods
    const reset = controller.reset.bind(controller);
    const init = controller.init.bind(controller);
    const parse = controller.parse.bind(controller);
    const load = controller.load.bind(controller);

    this.regochRouter.notfound(reset, init, parse, load);
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
