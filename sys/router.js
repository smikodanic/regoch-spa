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
   * @param {{renderDelay:number, authGuards:string[]}} routeOpts - route options: {renderDelay: 10, authGuards: ['autoLogin', 'isLogged', 'hasRole']}
   * @returns {void}
   */
  when(route, ctrl, routeOpts = {}) {
    ctrl.renderDelay = routeOpts.renderDelay || ctrl.renderDelay || 0; // default is 0 ms
    const authGuards = routeOpts.authGuards || [];

    // prechecks
    if (!route && !!ctrl) { throw new Error(`Route is not defined for "${ctrl.constructor.name}" controller.`); }
    if (!!route && !ctrl) { throw new Error(`Controller is not defined for route "${route}".`); }
    if (/autoLogin|isLogged|hasRole/.test(authGuards.join()) && !ctrl.auth) { throw new Error(`Auth guards (autoLogin, isLogged, hasRole) are used but Auth is not injected in the controller ${ctrl.constructor.name}. Use App::controllerAuth().`); }

    // navig functions
    const setCurrent = navig.setCurrent.bind(navig, ctrl); // set navig.current = {uri, ctrl}

    // Controller functions
    const init = ctrl.init.bind(ctrl);
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);

    if (authGuards.length && ctrl.auth) {
      // Auth guards
      const autoLogin = ctrl.auth.autoLogin.bind(ctrl.auth);
      const isLogged = ctrl.auth.isLogged.bind(ctrl.auth);
      const hasRole = ctrl.auth.hasRole.bind(ctrl.auth);

      const guards = [];
      if (authGuards.indexOf('autoLogin') !== -1) { guards.push(autoLogin); }
      if (authGuards.indexOf('isLogged') !== -1) { guards.push(isLogged); }
      if (authGuards.indexOf('hasRole') !== -1) { guards.push(hasRole); }

      this.regochRouter.def(route, setCurrent, ...guards, init, prerender, render, postrender);

    } else {
      this.regochRouter.def(route, setCurrent, init, prerender, render, postrender);
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
    const init = ctrl.init.bind(ctrl);
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);

    this.regochRouter.notfound(setCurrent, init, prerender, render, postrender);
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
    debug('router', `--------- _testRoutes (start) ------`, '#680C72', '#E59FED');
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
    debug('router', `--------- _testRoutes (end) ------`, '#680C72', '#E59FED');
  }



}





module.exports = new Router();
