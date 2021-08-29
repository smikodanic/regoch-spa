const RegochRouter = require('regoch-router');
const navig = require('./lib/navig');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({ debug: false });
    this.debugOpts = { router: false };
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} ctrl - route controller instance
   * @param {{authGuards:string[]}} routeOpts - route options: {authGuards: ['autoLogin', 'isLogged', 'hasRole']}
   * @returns {void}
   */
  when(route, ctrl, routeOpts = {}) {
    const authGuards = routeOpts.authGuards || [];

    // autorender
    if (routeOpts.autorender !== undefined) { ctrl.autorender = routeOpts.autorender; }

    // prechecks
    if (!route && !!ctrl) { throw new Error(`Route is not defined for "${ctrl.constructor.name}" controller.`); }
    if (!!route && !ctrl) { throw new Error(`Controller is not defined for route "${route}".`); }
    if (/autoLogin|isLogged|hasRole/.test(authGuards.join()) && !ctrl.auth) { throw new Error(`Auth guards (autoLogin, isLogged, hasRole) are used but Auth is not injected in the controller ${ctrl.constructor.name}. Use App::controllerAuth().`); }

    const setNavigCurrent = navig.setCurrent.bind(navig, ctrl); // set navig.current = {uri, ctrl}
    const preflight = !!ctrl.preflight ? ctrl.preflight : () => { }; // array of preflight functions, will be executed on every route before controller loader()
    const processing = ctrl.processing.bind(ctrl);

    if (authGuards.length && ctrl.auth) {
      // Auth guards
      const autoLogin = ctrl.auth.autoLogin.bind(ctrl.auth);
      const isLogged = ctrl.auth.isLogged.bind(ctrl.auth);
      const hasRole = ctrl.auth.hasRole.bind(ctrl.auth);

      const guards = [];
      if (authGuards.indexOf('autoLogin') !== -1) { guards.push(autoLogin); }
      if (authGuards.indexOf('isLogged') !== -1) { guards.push(isLogged); }
      if (authGuards.indexOf('hasRole') !== -1) { guards.push(hasRole); }

      this.regochRouter.def(route, ...guards, setNavigCurrent, ...preflight, processing);

    } else {
      this.regochRouter.def(route, setNavigCurrent, ...preflight, processing);
    }

  }



  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  notfound(ctrl) {
    const setNavigCurrent = navig.setCurrent.bind(navig, ctrl);
    const processing = ctrl.processing.bind(ctrl);
    this.regochRouter.notfound(setNavigCurrent, processing);
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
    this._debug('router', `--------- _testRoutes (start) ------`, '#680C72', '#E59FED');
    const startTime = new Date();

    navig.setPrevious(); // copy current to previous

    const uri = navig.getCurrentURI(); // get the current uri: /page/2?id=55 (no hash in the uri)

    // execute route middlewares, i.e. controller only if the URL is changed
    if (uri !== navig.previous.uri) {
      try {
        // destroy previous controller
        if (!!navig && !!navig.previous && !!navig.previous.ctrl) {
          this._debug('router', `_testRoutes - destroy() of previous controller`, '#680C72');
          navig.previous.ctrl.destroy(pevent); // execute destroy() defined in the Controller.js
        }

        // execute route middlewares
        this.regochRouter.trx = { uri, navig };
        const trx = await this.regochRouter.exe();

        // navig.previous.ctrl !== navig.current.ctrl in case when two routes share same controller
        if (!!navig && !!navig.previous && !!navig.previous.ctrl && navig.previous.ctrl !== navig.current.ctrl) {
          this._debug('router', `_testRoutes - rgKILL() of previous controller`, '#680C72');
          navig.previous.ctrl.rgKILL(); // kill controller's event listeners
        }

        if (this._debug().router) {
          console.log('_testRoutes::pevent:::', pevent);
          console.log('_testRoutes::trx:::', trx);
          console.log('_testRoutes::current.uri:::', navig.current.uri); // current URI is set in the controller middleware (setCurrent() function)
          console.log('_testRoutes::current.ctrl:::', navig.current.ctrl);
          console.log('_testRoutes::previous.uri:::', navig.previous.uri);
          console.log('_testRoutes::previous.ctrl:::', navig.previous.ctrl);
        }

      } catch (err) {
        if (/AuthWarn::/.test(err.message)) { console.log(`%c${err.message}`, `color:#FF6500; background:#FFFEEE`); }
        else { console.error(err); }
      }

    } else {
      if (this._debug().router) { console.log(`Current uri "${uri}" is same as previous uri "${navig.previous.uri}". Controller is not executed !`); }
    }

    // get elapsed time
    const endTime = new Date();
    const timeDiff = endTime - startTime;
    this._debug('router', `--------- _testRoutes (end) -- ELAPSED: ${timeDiff} ms ------`, '#680C72', '#E59FED');
  }


  /******** DEBUG *******/
  _debug(tip, text, color, background) {
    if (this.debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
    return this.debugOpts;
  }



}





module.exports = new Router();
