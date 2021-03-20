const eventEmitter = require('./eventEmitter');
const Form = require('./Form');
const HTTPClient = require('./HTTPClient');
const Load = require('./Load');
const Parse = require('./Parse');
const router = require('./router');
const util = require('./util');
const Cookie = require('./Cookie');


class App {

  constructor() {
    this.CONF = {};
    this.CONST = {};
    this.sys = {};
    this.controllers = {};
  }


  /**
   * Set configuration.
   * @param {string} name
   * @param {any} value
   */
  conf(name, value) {
    if (name === 'app') {
      const requiredFields = ['baseURL'];
      const fields = Object.keys(value) || [];
      for (const requiredField of requiredFields) {
        if (fields.indexOf(requiredField) === -1) { throw new Error(`The property "${requiredField}" is required in the app configuration.`); }
      }
    }
    this.CONF[name] = value;
    return this;
  }


  /**
   * Set constants.
   * @param {string} name
   * @param {any} value
   */
  const(name, value) {
    this.CONST[name] = value;
    return this;
  }


  /**
   * Freeze constant and configuration objects what prevents modifications in the controllers.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
   */
  freeze() {
    Object.freeze(this.CONF);
    Object.freeze(this.CONST);
  }


  system(httpClientCnf) {
    this.sys.eventEmitter = eventEmitter;
    this.sys.util = util;
    this.sys.Form = Form;
    this.sys.HTTPClient = HTTPClient;
    this.sys.httpClient = new HTTPClient(httpClientCnf);
    this.sys.load = new Load(this.CONF.app.baseURL, this.sys.httpClient);
    this.sys.parse = new Parse();
    this.sys.Cookie = Cookie;
  }


  /**
   * Create controller instances.
   * @param  {string[][]} Ctrls
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
   */
  routes(routesCnf) {
    for (const routeCnf of routesCnf) {
      const cmd = routeCnf[0]; // 'when', 'notFound'

      if (cmd === 'when') {
        const route = routeCnf[1]; // '/page1'
        const ctrlName = routeCnf[2]; // 'Page1Ctrl'
        const ctrl = this.controllers[ctrlName];
        router.when(route, ctrl);
      }
      else if (cmd === 'notFound') {
        const ctrlName = routeCnf[1]; // 'Page1Ctrl'
        const ctrl = this.controllers[ctrlName];
        router.notFound(ctrl);
      }
    }
    return this;
  }


  /**
   * Run the app
   */
  run() {
    router.use();
  }

}


module.exports = App;
