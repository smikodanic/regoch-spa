const RegochRouter = require('regoch-router');
const navigator = require('./lib/navigator');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} ctrl - route controller instance
   * @param {{autoLogin:boolean, isLogged:boolean, hasRole:boolean}} authGuards - Auth guards
   * @returns {void}
   */
  when(route, ctrl, authGuards) {
    if (!route) { throw new Error(`Route is not defined for ${ctrl.constructor.name} controller.`); }
    if (authGuards && (authGuards.autoLogin || authGuards.isLogged || authGuards.hasRole) && !ctrl.auth) { throw new Error(`Auth guards (autoLogin, isLogged, hasRole) are used but Auth is not injected in the controller ${ctrl.constructor.name}. Use App::controllerAuth().`); }

    // Controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    if (ctrl.auth) {
      // Auth guards
      const autoLogin = ctrl.auth.autoLogin.bind(ctrl.auth);
      const isLogged = ctrl.auth.isLogged.bind(ctrl.auth);
      const hasRole = ctrl.auth.hasRole.bind(ctrl.auth);

      const guards = [];
      if (!!authGuards && authGuards.autoLogin) { guards.push(autoLogin); }
      if (!!authGuards && authGuards.isLogged) { guards.push(isLogged); }
      if (!!authGuards && authGuards.hasRole) { guards.push(hasRole); }

      this.regochRouter.def(route, ...guards, prerender, render, postrender, init);

    } else {
      this.regochRouter.def(route, prerender, render, postrender, init);
    }

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
    // test URI against routes when element with data-rg-href attribute is clicked
    navigator.onPushstate(event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log('pushstate:::', uri, event.detail);
      this._testRoutes(uri);
    });

    navigator.onPopstate(event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log('popstate:::', uri, event.detail);
      this._testRoutes(uri);
    });

    // test URI against routes when browser's Reload button is clicked
    const uri = window.location.pathname + window.location.search; // /page1.html?q=12
    this._testRoutes(uri);
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
      .catch(err => console.log(`%cRouterWarning: ${err.message}`, `color:#FF6500; background:#FFFEEE`));
  }



}





module.exports = new Router();
