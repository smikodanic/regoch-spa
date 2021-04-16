const RegochRouter = require('regoch-router');
const navig = require('./lib/navig');
const debug = require('./debug');



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

    // navig functions
    const setCurrent = navig.setCurrent.bind(navig, ctrl);

    // Controller functions
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

      this.regochRouter.def(route, setCurrent, ...guards, prerender, render, postrender, init);

    } else {
      this.regochRouter.def(route, setCurrent, prerender, render, postrender, init);
    }

  }



  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  notfound(ctrl) {
    // navig functions
    const setCurrent = navig.setCurrent.bind(navig, ctrl);

    // controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.notfound(setCurrent, prerender, render, postrender, init);
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
    const cb = () => {
      window.history.pushState(null, '', toRoute); // change URL in the address bar
    };
    this.regochRouter.redirect(fromRoute, toRoute, cb);
  }



  /**
   * Execute all defined routes.
   */
  use() {
    /* 1) test URI against routes when element with data-rg-href attribute is clicked
       2) test URI against routes when BACK/FORWARD button is clicked */
    navig.onUrlChange(pevent => {
      this._testRoutes(pevent);
    });

    this._testRoutes(); // test URI against routes when browser's Reload button is clicked
  }



  /**
   * Match routes against current browser URI.
   * @param {Event} pevent - popstate or pushstate event
   * @returns {void}
   */
  async _testRoutes(pevent) {
    navig.setPrevious(); // copy current to previous

    const uri = navig.getCurrentURI(); // get the current uri: /page/2?id=55 (no hash in the uri)

    // execute route middlewares, i.e. controller only if the URL is changed
    if (uri !== navig.previous.uri) {
      try {
        if(navig && navig.previous && navig.previous.ctrl) {
          navig.previous.ctrl.rgKILL(); // kill controller's event listeners
          navig.previous.ctrl.destroy(pevent); // execute destroy() hook defined in the controller
        }

        this.regochRouter.trx = { uri };
        const trx = await this.regochRouter.exe();

        if (debug().router) {
          console.log('_testRoutes::pevent:::', pevent);
          console.log('_testRoutes::trx:::', trx);
          console.log('_testRoutes::current.uri:::', navig.current.uri); // current URI is set in the controller middleware (setCurrent() function)
          console.log('_testRoutes::previous.uri:::', navig.previous.uri);
        }


      } catch(err) {
        if (/AuthWarn::/.test(err.message)) { console.log(`%c${err.message}`, `color:#FF6500; background:#FFFEEE`); }
        else { console.error(err); }
      }

    } else {
      if (debug().router) { console.log(`Current uri "${uri}" is same as previous uri "${navig.previous.uri}". Controller is not executed !`);}
    }
  }



}





module.exports = new Router();
