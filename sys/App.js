const router = require('./router');
const eventEmitter = require('./lib/eventEmitter');
const Form = require('./lib/Form');
const HTTPClient = require('./lib/HTTPClient');
const util = require('./lib/util');
const Cookie = require('./lib/Cookie');
const Auth = require('./lib/Auth');
const navigator = require('./lib/navigator');



class App {

  constructor() {
    this.CONF = {};
    this.CONST = {};
    this.syslib = {};
    this.lib = {};
    this.controllers = {};

    // define global variable
    window.regoch = {
      viewsCompiled: {}
    };

    this._systemLibrary(); // app.syslib
  }


  /*============================== CONFIGURATIONS & CONSTANTS - this.CONF & this.CONST ==============================*/
  /**
   * Set configuration.
   * @param {string} name
   * @param {any} value
   * @returns {App}
   */
  conf(name, value) {
    this.CONF[name] = value;
    return this;
  }

  /**
   * Set constants.
   * @param {string} name
   * @param {any} value
   * @returns {App}
   */
  const(name, value) {
    this.CONST[name] = value;
    return this;
  }

  /**
   * Freeze constant and configuration objects what prevents modifications in the controllers.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   * @returns {void}
   */
  freeze() {
    Object.freeze(this.CONF);
    Object.freeze(this.CONST);
  }



  /*============================== SYSTEM - this.syslib ==============================*/
  /**
   * Inject system libraries.
   * @returns {void}
   */
  _systemLibrary() {
    if (!!this.controllers && !!this.controllers.length) { throw new Error('System should be defined before controllers.'); }
    this.syslib = { eventEmitter, util, Form, HTTPClient, Cookie, Auth, navigator };
  }



  /*============================== LIBRARY - this.lib ==============================*/
  /**
   * Add libraries to libraries already injected by libInject()
   * @param {object} libs - libraries which will be added to existing this.lib -  {Lib1, lib2}
   * @returns {void}
   */
  libInject(libs) {
    this.lib = Object.assign(this.lib, libs);
  }

  /**
   * Remove all libraries.
   * @returns {void}
   */
  libEmpty() {
    this.lib = {};
  }



  /*============================== LIBRARY - this.lib ==============================*/
  /**
   * Inject the content of the app/dist/views/compild.json .
   * @param {object} viewsCompiled
   */
  compiled(viewsCompiled) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount !== 0) { throw new Error('The method compiled() should be used before the method controller() !'); }
    window.regoch.viewsCompiled = viewsCompiled;
  }



  /*============================== CONTROLLERS & ROUTES - this.controllers ==============================*/
  /**
   * Create controller instances and inject into the this.controllers.
   * @param  {string[][]} Ctrls
   * @returns {App}
   */
  controller(Ctrls) {
    for(const Ctrl of Ctrls) {
      this.controllers[Ctrl.name] = new Ctrl(this);
    }
    return this;
  }


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
        if (!this.controllers[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.controllers[ctrlName];
        router.when(route, ctrl);
      } else if (cmd === 'notfound') {
        const ctrlName = routeCnf[1]; // 'NotfoundCtrl'
        if (!this.controllers[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.controllers[ctrlName];
        router.notfound(ctrl);
      } else if (cmd === 'do') {
        const funcs = routeCnf.filter((routeCnfElem, key) => { if (key !== 0) {return routeCnfElem;} });
        router.do(...funcs);
      } else if (cmd === 'redirect') {
        const fromRoute = routeCnf[1];
        const toRoute = routeCnf[1];
        router.redirect(fromRoute, toRoute);
      }
    }
    return this;
  }


  /**
   * Run the app by executing the router.
   * @returns {void}
   */
  run() {
    router.use();
  }

}


module.exports = App;
