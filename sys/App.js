const router = require('./router');


class App {

  constructor() {
    this.CONST = {};
    this.syslib = {};
    this.lib = {};
    this.controllers = {};

    // define global variable
    window.regoch = {
      viewsCompiled: {}
    };
  }


  /*============================== CONSTANTS - this.CONST ==============================*/
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
   * Freeze constant objects what prevents accidental modifications in the controllers.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   * @returns {void}
   */
  freeze() {
    Object.freeze(this.CONF);

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



  /*============================== COMPILED VIEWS ==============================*/
  /**
   * Inject the content of the app/dist/views/compiled.json .
   * @param {object} viewsCompiled
   */
  compiled(viewsCompiled) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount > 0) { throw new Error('The method compiled() should be used before the method controller() !'); }
    window.regoch.viewsCompiled = viewsCompiled;
  }



  /*============================== CONTROLLERS & ROUTES - this.controllers ==============================*/
  /**
   * Create controller instances and inject into the this.controllers.
   * @param  {Class[]} Ctrls - array of controller classes
   * @returns {App}
   */
  controller(Ctrls) {
    for(const Ctrl of Ctrls) {
      const ctrl = new Ctrl(this);
      this.controllers[Ctrl.name] = ctrl;
    }
    return this;
  }



  /**
   * Inject the auth library into the all controllers and use it as this.auth in the controller.
   * Useful in apps where authentication guards are required in all routes, for example when building a web panel.
   * @param {Auth} auth - Auth class instance
   * @returns {App}
   */
  authInject(auth) {
    const controllersCount = Object.keys(this.controllers).length;
    if (controllersCount === 0) { throw new Error('The method authInject() should be used after the method controller() !'); }
    for (const ctrlName of Object.keys(this.controllers)) {
      this.controllers[ctrlName].auth = auth;
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
        const authGuards = routeCnf[3]; // {autoLogin:boolean, isLogged:boolean, hasRole:boolean}
        if (!this.controllers[ctrlName]) { throw new Error(`Controller "${ctrlName}" is not defined or not injected in the App.`); }
        const ctrl = this.controllers[ctrlName];
        router.when(route, ctrl, authGuards);
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
