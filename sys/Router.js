const RegochRouter = require('regoch-router');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }

  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {Class} Ctrl - route function
   * @param {string} view - view path, for example: '/pages/page1/page1.html'
   * @returns {void}
   */
  when(route, Ctrl, view) {
    const controller = new Ctrl();
    if (!!route && !!controller.init) {
      this.regochRouter.def(route, controller.init.bind(controller));
    }
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {Class} Ctrl - route function
   * @param {string} view - view path, for example: '/pages/page1/page1.html'
   * @returns {void}
   */
  notFound (Ctrl) {
    const controller = new Ctrl();
    if (!!controller.init) {
      this.regochRouter.notfound(controller.init.bind(controller));
    }
  }



  /**
   * Match routes against current browser URI.
   * @param {string} uri - browser's address bar URI
   * @returns {void}
   */
  testRoutes(uri) {
    this.regochRouter.trx = { uri };
    console.log(this.regochRouter.trx);
    this.regochRouter.exe()
      .then(trx => console.log('Route executed trx:: ', trx))
      .catch(err => console.log('ERRrouter:: ', err));
  }



}





module.exports = Router;
