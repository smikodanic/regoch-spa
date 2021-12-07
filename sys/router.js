const RegochRouter = require('./lib/RegochRouter');


class Router extends RegochRouter {

  constructor() {
    super({ debug: false });
  }


  /**
   * Define the routes
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} ctrl - route controller instance
   * @param {{authGuards:string[]}} routeOpts - route options: {authGuards: ['autoLogin', 'isLogged', 'hasRole']}
   * @returns {void}
   */
  _when(route, ctrl, routeOpts = {}) {
    const authGuards = routeOpts.authGuards || [];

    // prechecks
    if (!route && !!ctrl) { throw new Error(`Route is not defined for "${ctrl.constructor.name}" controller.`); }
    if (!!route && !ctrl) { throw new Error(`Controller is not defined for route "${route}".`); }
    if (/autoLogin|isLogged|hasRole/.test(authGuards.join()) && !ctrl.auth) { throw new Error(`Auth guards (autoLogin, isLogged, hasRole) are used but Auth is not injected in the controller ${ctrl.constructor.name}. Use App::controllerAuth().`); }

    const guards = [];
    if (authGuards.length && ctrl.auth) {
      const autoLogin = ctrl.auth.autoLogin.bind(ctrl.auth);
      const isLogged = ctrl.auth.isLogged.bind(ctrl.auth);
      const hasRole = ctrl.auth.hasRole.bind(ctrl.auth);
      if (authGuards.indexOf('autoLogin') !== -1) { guards.push(autoLogin); }
      if (authGuards.indexOf('isLogged') !== -1) { guards.push(isLogged); }
      if (authGuards.indexOf('hasRole') !== -1) { guards.push(hasRole); }
    }

    const preflight = !!ctrl.preflight ? ctrl.preflight : []; // array of preflight functions, will be executed on every route before the controller's loader()
    const ctrl_processing = ctrl.processing.bind(ctrl);
    const postflight = !!ctrl.postflight ? ctrl.postflight : []; // array of postflight functions, will be executed on every route ater the controller's postrend()

    this.when(route, ...guards, ...preflight, ctrl_processing, ...postflight);
  }



  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  _notfound(ctrl) {
    const ctrl_processing = ctrl.processing.bind(ctrl);
    this.notfound(ctrl_processing);
  }



  /**
   * Define functions which will be executed on every route.
   * @param {Function[]} funcs - function which will be executed on every request, e.g. every exe()
   * @returns {Router}
   */
  _do(...funcs) {
    this.do(...funcs);
  }



  /**
   * Redirect from one route to another route.
   * @param {string} fromRoute - new route
   * @param {string} toRoute - destination route (where to redirect)
   * @returns {Router}
   */
  _redirect(fromRoute, toRoute) {
    const cb = () => {
      window.history.pushState(null, '', toRoute); // change URL in the address bar
    };
    this.redirect(fromRoute, toRoute, cb);
  }



  /**
   * Match routes against current browser URI and execute matched route.
   * @param {Event} pevent - popstate or pushstate event
   * @returns {void}
   */
  async _exe(pevent) {
    try {
      const start = new Date();
      const uri = window.location.pathname + window.location.search; // the current uri -  The uri is path + query string, without hash, for example: /page1.html?q=12
      console.log(`%c --------- route start --> ${uri} ------`, 'color:#680C72; background:#E59FED');


      // execute matched route middlewares
      this.trx = { uri, pevent };
      const trx = await this.exe();

      const end = new Date();
      trx.elapsedTime = (end - start) + ' ms'; // in miliseconds

      console.log(`%c --------- route end --> elapsedTime: ${this.trx.elapsedTime} ------`, 'color:#680C72; background:#E59FED');

    } catch (err) {
      if (/AuthWarn::/.test(err.message)) { console.log(`%c${err.message}`, `color:#FF6500; background:#FFFEEE;`); }
      else { console.error(err); }
    }
  }



}





module.exports = new Router();
