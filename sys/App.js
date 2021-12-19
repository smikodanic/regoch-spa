const Router = require('./router/Router');
const navig = require('./lib/navig');
const debugOpts = require('./conf/$debugOpts');


class App {

  constructor() {
    this.ctrls = {}; // { ctrlName1: {}, ctrlName2: {} }
    window.regochGlob = {}; // init global variable
    this.$debugOpts = debugOpts; // object with the debug parameters -- {rgFor: true, rgIf: false}
  }

  /*============================== CONTROLLERS ==============================*/
  /**
   * Create controller instances and inject into the app.controllers.
   * @param  {Class[]} Ctrls - array of controller classes
   * @returns {App}
   */
  controllers(Ctrls) {
    for (const Ctrl of Ctrls) {
      const ctrl = new Ctrl(this);
      this.ctrls[Ctrl.name] = ctrl;
    }
    return this;
  }


  /**
   * Define controller property/value. Sometimes it's useful that all controllers have same property with the same value.
   * @param {string} name - controller property name
   * @param {any} val - value
   * @returns
   */
  _controllerProp(name, val) {
    const controllersCount = Object.keys(this.ctrls).length;
    if (controllersCount === 0) { throw new Error(`The controller property "${name}" should be defined after the method controllersInject().`); }
    for (const ctrlName of Object.keys(this.ctrls)) { this.ctrls[ctrlName][name] = val; }
    return this;
  }


  /**
   * Set the subproperty of the controller's $fridge property in all controllers.
   * The $fridge object will be preserved during controller processing execution. Other controller's properties will be deleted.
   * @param {string} name - $fridge property name
   * @param {any} val - value
   * @returns {App}
   */
  fridge(name, val) {
    const controllersCount = Object.keys(this.ctrls).length;
    if (controllersCount === 0) { throw new Error(`The $fridge property "${name}" should be defined after the method controllersInject().`); }
    for (const ctrlName of Object.keys(this.ctrls)) { this.ctrls[ctrlName]['$fridge'][name] = val; }
    return this;
  }


  /**
   * Inject the auth library into the all controllers and use it as this.$auth in the controller.
   * Useful in apps where authentication guards are required in all routes, for example when building a web panel.
   * @param {Auth} auth - Auth class instance
   * @returns {App}
   */
  auth(auth) {
    this._controllerProp('$auth', auth);
    return this;
  }


  /**
   * Inject the content of the /app/cache/views.json.
   * Useful to speed up the HTML view load, especially in data-rg-inc elements.
   * @param {object} viewsCached - the content of the /app/cache/views.json file
   * @returns {App}
   */
  viewsCached(viewsCached) {
    // this.controllerProp('viewsCached', viewsCached);
    window.regochGlob.viewsCached = viewsCached;
    return this;
  }


  /**
   * Define preflight functions which will be executed on every route, before the controller processing() i.e. before loader().
   * Never define $model in the preflight function because it will triger render() before loader().
   * @param {Function[]} funcs - array of preflight functions (app, trx) => { ... }
   * @returns {App}
   */
  preflight(...funcs) {
    this._controllerProp('$preflight', funcs);
    return this;
  }


  /**
   * Define postflight functions which will be executed on every route, after the controller processing(), i.e. after the postrend().
   * Here the $model can be defined (what wil trigger the render()).
   * @param {Function[]} funcs - array of preflight functions (app, trx) => { ... }
   * @returns {App}
   */
  postflight(...funcs) {
    this._controllerProp('$postflight', funcs);
    return this;
  }


  /**
   * Define the debugging options. Set the controller's $debugOpts property.
   * @param {Function[]} funcs - array of preflight functions (app, trx) => { ... }
   * @returns {App}
   */
  debugger($debugOpts) {
    if (!!$debugOpts) { this.$debugOpts = $debugOpts; }
    this._controllerProp('$debugOpts', this.$debugOpts);
    return this;
  }




  /*============================== ROUTES ==============================*/
  /**
   * Define routes
   * @param {string[][]} routesCnf
   * @returns {App}
   */
  routes(routesCnf) {
    const router = new Router(this.$debugOpts.router, this.$debugOpts.regochRouter);

    for (const routeCnf of routesCnf) {
      const cmd = routeCnf[0]; // '_def', '_notfound'

      if (cmd === 'when') {
        const route = routeCnf[1]; // '/page1'
        const ctrlName = routeCnf[2]; // 'Page1Ctrl'
        const routeOpts = routeCnf[3]; // {authGuards: ['autoLogin', 'isLogged', 'hasRole']}
        if (!this.ctrls[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.ctrls[ctrlName];
        router._when(route, ctrl, routeOpts);

      } else if (cmd === 'notfound') {
        const ctrlName = routeCnf[1]; // 'NotfoundCtrl'
        if (!this.ctrls[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.ctrls[ctrlName];
        router._notfound(ctrl);

      } else if (cmd === 'do') {
        const funcs = routeCnf.filter((routeCnfElem, key) => { if (key !== 0) { return routeCnfElem; } });
        router._do(...funcs);

      } else if (cmd === 'redirect') {
        const fromRoute = routeCnf[1];
        const toRoute = routeCnf[2];
        router._redirect(fromRoute, toRoute);
      }
    }


    // test URI against routes when browser's Reload button is clicked
    router._exe();

    // A) test URI against routes when element with data-rg-href attribute is clicked --> 'pushstate'
    // B) test URI against routes when BACK/FORWARD button is clicked --> 'popstate'
    navig.onUrlChange(pevent => {
      router._exe(pevent); // pevent is popstate or pushstae event (see navig.onUrlChange())
    });

    return this;
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
