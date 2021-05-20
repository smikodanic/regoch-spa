const router = require('./router');


class App {

  constructor() {
    this.CONST = {};
    this.lib = {};
    this.controllers = {};
    window.regochSPA = {}; // define global variable
    this.router = router;
  }


  /*============================== CONSTANTS ==============================*/
  /**
   * Set constants.
   * @param {string} name
   * @param {any} val
   * @returns {App}
   */
  const(name, val) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount > 0) { throw new Error('The method const() should be defined before the method controller().'); }
    this.CONST[name] = val;
    return this;
  }

  /**
   * Freeze constant objects what prevents accidental modifications in the controllers.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   * @returns {void}
   */
  freeze() {
    Object.freeze(this.CONST);
  }

  /**
   * Remove all constants.
   * @returns {void}
   */
  constEmpty() {
    this.CONST = {};
  }



  /*============================== LIBRARIES ==============================*/
  /**
   * Add libraries to libraries already injected by libInject()
   * @param {object} libs - libraries which will be added to existing this.lib -  {Lib1, lib2}
   * @returns {void}
   */
  libInject(libs) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount > 0) { throw new Error('The method libInject() should be defined before the method controller().'); }
    this.lib = Object.assign(this.lib, libs);
  }

  /**
   * Remove all libraries.
   * @returns {void}
   */
  libEmpty() {
    this.lib = {};
  }



  /*============================== CONTROLLERS ==============================*/
  /**
   * Create controller instances and inject into the app.controllers.
   * @param  {Class[]} Ctrls - array of controller classes
   * @returns {App}
   */
  controllersInject(Ctrls) {
    for(const Ctrl of Ctrls) {
      const ctrl = new Ctrl(this);
      this.controllers[Ctrl.name] = ctrl;
    }
    return this;
  }


  /**
   * Define controller property/value. Sometimes it's useful that all controllers have same property with the same value.
   * @param {string} name - controller property name
   * @returns
   */
  controllerProp(name, val) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount === 0) { throw new Error(`The controller property "${name}" should be defined after the method controller() is used.`); }
    for (const ctrlName of Object.keys(this.controllers)) {
      this.controllers[ctrlName][name] = val;
    }

    return this;
  }


  /**
   * Inject the auth library into the all controllers and use it as this.auth in the controller.
   * Useful in apps where authentication guards are required in all routes, for example when building a web panel.
   * @param {Auth} auth - Auth class instance
   * @returns {App}
   */
  controllerAuth(auth) {
    this.controllerProp('auth', auth);
    return this;
  }


  /**
   * Inject the content of the /app/cache/views.json.
   * Useful to speed up the HTML view load, especially in data-rg-inc elements.
   * @param {object} viewsCached - the content of the /app/cache/views.json file
   * @returns {App}
   */
  controllerViewsCached(viewsCached) {
    this.controllerProp('viewsCached', viewsCached);
    return this;
  }


  /**
   * Define preflight function which will be executed on every route and before controller loader().
   * @param {Function[]} funcs - array of preflight functions (app, trx) => { ... }
   * @returns {App}
   */
  preflight(...funcs) {
    this.controllerProp('preflight', funcs);
    return this;
  }




  /*============================== ROUTES ==============================*/
  /**
   * Define routes
   * @param {string[][]} routesCnf
   * @returns {App}
   */
  routes(routesCnf) {
    for (const routeCnf of routesCnf) {
      const cmd = routeCnf[0]; // 'when', 'notFound'

      if (cmd === 'when') {
        const route = routeCnf[1]; // '/page1'
        const ctrlName = routeCnf[2]; // 'Page1Ctrl'
        const routeOpts = routeCnf[3]; // {authGuards: ['autoLogin', 'isLogged', 'hasRole']}
        if (!this.controllers[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.controllers[ctrlName];
        this.router.when(route, ctrl, routeOpts);
      } else if (cmd === 'notfound') {
        const ctrlName = routeCnf[1]; // 'NotfoundCtrl'
        if (!this.controllers[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.controllers[ctrlName];
        this.router.notfound(ctrl);
      } else if (cmd === 'do') {
        const funcs = routeCnf.filter((routeCnfElem, key) => { if (key !== 0) {return routeCnfElem;} });
        this.router.do(...funcs);
      } else if (cmd === 'redirect') {
        const fromRoute = routeCnf[1];
        const toRoute = routeCnf[2];
        this.router.redirect(fromRoute, toRoute);
      }
    }

    return this;
  }


  /**
   * Run the app by executing the router.
   * @returns {void}
   */
  run() {
    this.router.use();
  }


  /********** EVENTS **********/
  /**
   * Fired when HTML doc with the all resources is loaded.
   * https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload
   * @param {Function} cb - callback, () => { ... }
   */
  onReady(cb) {
    window.onload = cb;
  }


  /**
   * Fired when HTML doc is loaded without CSS, IMG and other resources.
   * https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
   * @param {Function} cb - callback, event => { ... }
   */
  onDOMLoaded(cb) {
    document.addEventListener('DOMContentLoaded', cb);
  }


  /**
   * Listen for the DOM changes. Creates app.DOMObserver.
   * How to use:
   * app.createDOMObserver((mutationsList, observer) => { ... });
   * const targetNode = document.querySelector('p#my-id); const config = { attributes: true, childList: true, subtree: true };
   * app.DOMObserver.observe(targetNode, config);
   * To stop observing use: app.DOMObserver.disconnect();
   * https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
   * @param {Function} cb - callback, (mutationsList, observer) => { ... }
   */
  createDOMObserver(cb) {
    this.DOMObserver = new MutationObserver(cb);
  }


}


module.exports = App;
