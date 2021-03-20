/*!
, * Regoch SPA v1.0.0 (http://www.regoch.org/spa)
, * Copyright 2014-2021, Sasa Mikodanic <smikodanic@gmail.com>
, * Licensed under AGPL-3.0 
, */

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "inc/footer.html": "<div id=\"footer\"><p>This is the first footer.</p><span data-rg-view=\"footer2\">--- load footer2 ---</span></div>",
  "inc/footer2.html": "<b>Bold footer2.</b> My tekst. <span data-rg-view=\"footer3\">--- load footer3 ---</span>",
  "inc/footer3.html": "<br><i>This is italic footer3.</i> <span style=\"color:red\">The red tekst.</span>",
  "inc/header.html": "<h2>HEADER <small>little boy</small> <b>boldy</b></h2><p>Header txt.</p>"
}
},{}],2:[function(require,module,exports){
const App = require('../../sys/App');

const routesCnf = require('./conf/routesCnf');
const appCnf = require('./conf/appCnf');
const httpClientCnf = require('./conf/httpClientCnf');

const Ctrls = require('./controllers');



const app = new App();
app
  .conf('app', appCnf)
  .conf('httpClient', httpClientCnf)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', {a: 22})
  .freeze();
app.system(httpClientCnf);
app
  .controller(Ctrls)
  .routes(routesCnf)
  .run();




},{"../../sys/App":13,"./conf/appCnf":3,"./conf/httpClientCnf":4,"./conf/routesCnf":5,"./controllers":11}],3:[function(require,module,exports){
module.exports = {
  baseURL: 'http://localhost:4400'
};

},{}],4:[function(require,module,exports){
module.exports = {
  encodeURI: true,
  timeout: 10000,
  retry: 5,
  retryDelay: 1300,
  maxRedirects: 0,
  headers: {
    'authorization': '',
    'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
    'content-type': 'text/html; charset=UTF-8'
  }
};

},{}],5:[function(require,module,exports){
// route definitions
module.exports = [
  ['when', '/', 'IndexCtrl'],
  ['when', '/page1', 'Page1Ctrl'],
  ['when', '/page/:pageNum', 'Page2Ctrl'],
  ['when', '/form', 'FormCtrl'],
  ['notFound', 'NotfoundCtrl'],
];

},{}],6:[function(require,module,exports){
const { Controller, Form, Load, Util } = require('../../../sys');



class FormCtrl extends Controller {

  constructor(app) {
    super();
    this.load = app.sys.load;
    this.util = app.sys.util;
    this.userForm = new app.sys.Form('userF');
  }

  async prerender(trx) {
    await this.load.view('home1', 'form.html');
  }


  async init(trx, dataRgs) {
    console.log('FORM init', trx, dataRgs);
  }



  async setFullName() {
    this.userForm.setControl('fullName', 'John');

    await this.util.sleep(1300);
    this.userForm.setControl('fullName', 'Johnny');

    await this.util.sleep(800);
    const fullName = this.userForm.getControl('fullName');
    console.log('fullName::', fullName);

    await this.util.sleep(800);
    this.userForm.delControl('fullName');
  }
  async getFullName() {
    const fullName = this.userForm.getControl('fullName');
    console.log('fullName::', fullName);
  }


  async setAge() {
    this.userForm.setControl('age', 23);
  }
  async getAge() {
    const age = this.userForm.getControl('age');
    console.log('age::', typeof age, age);
  }

  async setCountry() {
    this.userForm.setControl('country', 'Croatia');
    await this.util.sleep(1300);
    this.userForm.setControl('country', 'UK');
    await this.util.sleep(1300);
    this.userForm.delControl('country');
  }
  async getCountry() {
    const country = this.userForm.getControl('country');
    console.log('country::', country);
  }

  async setFamily() {
    this.userForm.setControl('family', ['Betty', 'Lara']);
  }
  async getFamily() {
    const family = this.userForm.getControl('family');
    console.log('family::', family);
  }
  async emptyFamily() {
    this.userForm.delControl('family');
  }

  async setJobs() {
    this.userForm.setControl('jobs', ['IT', 'Marketing']);
  }
  async getJobs() {
    const jobs = this.userForm.getControl('jobs');
    console.log('selected jobs::', jobs);
  }
  async emptyJobs() {
    this.userForm.delControl('jobs');
  }

  async setPet() {
    this.userForm.setControl('pet', 'cat');
  }
  async getPet() {
    const pet = this.userForm.getControl('pet');
    console.log('selected pet::', pet);
  }
  async emptyPet() {
    this.userForm.delControl('pet');
  }



  async setAll() {
    this.userForm.setControls({
      fullName: 'John Doe',
      age: 48,
      country: 'Kenya'
    });
  }




}


module.exports = FormCtrl;

},{"../../../sys":22}],7:[function(require,module,exports){
const { Controller } = require('../../../sys');


class IndexCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    this.load = app.sys.load;
    this.util = app.sys.util;
    this.httpClient = app.sys.httpClient; // or new app.sys.HTTPClient()
    this.controllers = app.controllers;

    const cookieOpts = {
      domain: 'localhost',
      path: '/',
      expires: 5, // number of days or exact date
      secure: false,
      httpOnly: false,
      sameSite: 'strict' // 'strict' for GET and POST, 'lax' only for POST
    };
    this.cookie = new app.sys.Cookie(cookieOpts, true);

    this.ifX = false;

    this.cookieForm = new app.sys.Form('cookieF');
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    // console.log(this.controllers.FormCtrl); // access the specific controller in the controller
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'sibling');
    await this.load.view('footer', 'inc/footer.html');
    await this.load.view('footer2', 'inc/footer2.html', '', 'outer');
    await this.load.view('footer3', 'inc/footer3.html', '', 'outer');
    await this.load.view('home1', 'home1.html');
    await this.load.view('home2', 'home2.html');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


  async init(trx) {
    console.log('HOME init', trx, this.dataRgs);
    this.product = {
      name: {
        x: 'Initial val'
      },
      colors: ['red', 'green']
    };
    this.rgPrint('product.name.x');

    await this.util.sleep(1300);
    this.product.name.x = 'Modified val';

    this.limit = 3;
    this.skip = 2;
    this.companies = [
      {name: 'Cloud Ltd', size: 3},
      {name: 'Roto Ltd', size: 5},
      {name: 'Zen Ltd', size: 8},
      {name: 'Den Ltd', size: 9},
      {name: 'Len Ltd', size: 10},
      {name: 'Pen Ltd', size: 81},
      {name: 'Gen Ltd', size: 82},
      {name: 'Ren Ltd', size: 83}
    ];
  }

  destroy(elem, event, dataRgs) {
    console.log('HOME destroy', elem, event, dataRgs);
  }



  async toggleIF() {
    this.ifX = !this.ifX;
    console.log('toggleIF::', this.ifX);
    this.rgIf('ifX');
  }


  runFOR() {
    this.companies = [
      {name: 'Cloud2 Ltd', size: 3},
      {name: 'Roto2 Ltd', size: 5},
      {name: 'Zen2 Ltd', size: 8},
      {name: 'Den2 Ltd', size: 81},
      {name: 'Len2 Ltd', size: 82},
      {name: 'Pen2 Ltd', size: 83},
      {name: 'Gen2 Ltd', size: 84},
      {name: 'Ren2 Ltd', size: 855}
    ];
    this.rgFor('companies');
    this.rgPrint('companies');
  }

  runREPEAT(num) {
    this.colors = ['red', 'green', 'blue', 'navy', 'cyan'];
    this.rgRepeat(num, 'colorID');
    this.rgSet('colors');
    this.rgPrint('colors');
  }

  runCLASS() {
    this.myKlases = ['my-bold', 'my-italic'];
    this.rgClass('myKlases');
  }

  runSTYLE(fontSize, color) {
    this.myStajl = {fontSize, color};
    this.rgStyle('myStajl');
  }

  runSWITCH() {
    this.myColorArr = ['green2', 'blue2'];
    this.rgSwitch('myColor'); // this.myColor
    this.rgSwitch('myColorArr @@ multiple'); // this.myColorArr
  }

  runELEM() {
    this.toggle = !this.toggle;
    if (this.toggle) {
      this.rgelems.myElem.style.color = 'blue';
    } else {
      this.rgelems.myElem.style.color = 'silver';
    }
  }


  runEVT(elem, evt, boja) {
    // console.log(elem);
    // console.log(evt);
    elem.style.color = boja;
  }

  runCHANGE() {
    console.log(this.mySelect);
    // reset all
    this.ifs = {
      one: false,
      two: false,
      three:false
    };
    this.ifOne = false;
    this.ifTwo = false;
    this.ifThree = false;

    // set one
    switch(this.mySelect) {
    case 'one': { this.ifs.one = true; break; }
    case 'two': { this.ifs.two = true; break; }
    case 'three': { this.ifs.three = true; break; }
    }

    // render
    this.rgSwitch('mySelect');
  }


  runCOOKIE() {
    const cookieVal1 = this.cookieForm.getControl('cookieVal1');
    const cookieVal2 = this.cookieForm.getControl('cookieVal2');
    const cookieMethod = this.cookieForm.getControl('cookieMethod');
    console.log(cookieMethod, ':', cookieVal1, cookieVal2);

    switch(cookieMethod) {
    case 'put': { this.cookie.put(cookieVal1, cookieVal2); break; }
    case 'putObject': { this.cookie.putObject('someObj', {x:22,y:'str'}); break; }
    case 'getAll': { console.log(this.cookie.getAll()); break; }
    case 'get': { console.log(this.cookie.get(cookieVal1)); break; }
    case 'getObject': { console.log(this.cookie.getObject('someObj')); break; }
    case 'remove': { this.cookie.remove(cookieVal1); break; }
    case 'removeAll': { this.cookie.removeAll(); break; }
    case 'empty': { this.cookie.empty(cookieVal1); break; }
    case 'exists': { console.log(this.cookie.exists(cookieVal1)); break; }
    }

  }



  clickFja(n, str, ...rest) {
    console.log('This is a click. Params::', n, str, rest);
    this.callAPI();
    if(rest[2]) {
      const elem = rest[2];
      elem.style.color = 'red';
      elem.style.backgroundColor = '#71F5D0';
    }
  }

  async callAPI() {
    const opts = {
      encodeURI: true,
      timeout: 10000,
      retry: 5,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'content-type': 'text/html; charset=UTF-8'
      }
    };
    const answer = await this.httpClient.askOnce('api.dex8.com');

    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/todos/1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts?userId=1', 'GET');
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts', 'POST', {title: 'foo', body: 'bar', userId: 1});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'PUT', {id: 1, title: 'foogoo', body: 'barboo', userId: 3});
    // const answer = await hc.askJSON('https://jsonplaceholder.typicode.com/posts/1', 'DELETE');

    // const answer = await hc.askJSON('https://api.dex8.com?q=my str'); // test encodeURI

    // const answer = await hc.ask('api.dex8.com'); // to test 408 timeout set opts:: timeout:10,retry:5,retryDelay:1300


    console.log(answer);
  }



  historyData() {
    console.log('window.history::', window.history);
  }
}


module.exports = IndexCtrl;

},{"../../../sys":22}],8:[function(require,module,exports){
const { Controller } = require('../../../sys');


class NotfoundCtrl extends Controller {

  init(trx) {
    console.error(`404 not found: ${trx.uri}`);
  }

}


module.exports = NotfoundCtrl;

},{"../../../sys":22}],9:[function(require,module,exports){
const { Controller, Load } = require('../../../sys');

class Page1Ctrl extends Controller {
  constructor(app) {
    super();
    console.log('PAGE1 constructor');
    this.load = app.sys.load;
  }

  async prerender(trx) {
    console.log('PAGE1 prerender', trx);
    $('title').text('PAGE 1');

    // views
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'append');
    await this.load.view('footer', 'inc/footer3.html');
    await this.load.view('home1', 'page1.html', 'h1');
    await this.load.view('home2', '');
  }

  init(trx, dataRgs) {
    console.log('PAGE1 init', trx, dataRgs);
  }

  destroy(elem, event, dataRgs) {
    console.log('PAGE1 destroy', elem, event, dataRgs);
  }




}


module.exports = Page1Ctrl;

},{"../../../sys":22}],10:[function(require,module,exports){
const { Controller, Load } = require('../../../sys');


class Page2Ctrl extends Controller {
  constructor(app) {
    super();
    this.load = app.sys.load;
  }

  init(trx, dataRgs) {
    console.log('PAGE2 init', trx, dataRgs);
    $('title').text('PAGE 2');
  }

}




module.exports = Page2Ctrl;

},{"../../../sys":22}],11:[function(require,module,exports){
const IndexCtrl = require('./IndexCtrl');
const Page1Ctrl = require('./Page1Ctrl');
const Page2Ctrl = require('./Page2Ctrl');
const FormCtrl = require('./FormCtrl');
const NotfoundCtrl = require('./NotfoundCtrl');

module.exports = [
  IndexCtrl,
  Page1Ctrl,
  Page2Ctrl,
  FormCtrl,
  NotfoundCtrl
];

},{"./FormCtrl":6,"./IndexCtrl":7,"./NotfoundCtrl":8,"./Page1Ctrl":9,"./Page2Ctrl":10}],12:[function(require,module,exports){
/**
 * Terminology
 * =================================
 * route :string - defined route in the def() method - /room/subscribe/:room_name/:id
 * routeParsed.full :string - full route (start and end slashes removed) - 'room/subscribe/:room_name/:id'
 * routeParsed.segments :number - number the full route segments (with param parts) - 4
 * routeParsed.base :number - route part without params segments (start and end slashes removed) - 'room/subscribe'
 *
 * uri :string - current URI - /room/subscribe/sasa/123?x=123&y=abc&z=false
 * uriParsed.path :string - complete uri (start and end slashes removed) - '/room/subscribe/sasa/123'
 * uriParsed.segments :number - number of the uri segments - 4
 * uriParsed.queryString :string - uri part after question mark as string - 'x=123&y=abc&z=false'
 * uriParsed.queryObject :object - uri part parsed as object - {x: 123, y: 'abc', z: false}
 *
 * body :any - data sent along with uri as the transitional object - trx: {uri, body}
 *
 * func :Function - route function - a function which is executed when certain route is matched against the uri
 * trx :object - transitional object which can be changed in the route functions, required field is "uri" - {uri, body, uriParsed, routeParsed, params, query}
 *
 * Notice
 *-----------
 * Variables "uri" and "body" are analogous to HTTP POST request, for example:  POST /room/subscribe/sasa/123?key=999  {a: 'something})
 */



class Router {

  /**
   * @param {object} routerOpts - router initial options {debug:boolean}
   */
  constructor(routerOpts) {
    this.routerOpts = routerOpts || {};
    this.trx; // transitional object {uri:string, body:any, ...}
    this.routeDefs = []; // route definitions [{route:string, routeParsed:object, funcs:Function[] }]
  }


  /**
   * Set transitional object.
   * @param {object} obj - {uri, body, ...}
   * @returns {void}
   */
  set trx(obj) {
    // required properties
    if (!obj.uri) { throw new Error('The "uri" property is required.'); }

    // "uri" and "body" as properties with constant value (can not be modified)
    Object.defineProperty(obj, 'uri', {
      value: obj.uri,
      writable: false
    });

    Object.defineProperty(obj, 'body', {
      value: obj.body,
      writable: false
    });

    // parse uri
    obj.uriParsed = this._uriParser(obj.uri);

    this._trx = obj;
  }


  /**
   * Get transitional object.
   * @returns {object} - {uri, body, ...}
   */
  get trx() {
    return this._trx;
  }



  /**
   * Define route, routeParsed and corresponding functions.
   * @param {string} route - /room/subscribe/:room_name
   * @param {Function[]} funcs - route functions
   * @returns {Router}
   */
  def(route, ...funcs) {
    this.routeDefs.push({
      route,
      routeParsed: this._routeParser(route),
      funcs
    });
    return this;
  }


  /**
   * Redirect from one route to another route.
   * @param {string} fromRoute - new route
   * @param {string} toRoute - destination route (where to redirect)
   * @returns {Router}
   */
  redirect(fromRoute, toRoute) {
    const toRouteDef = this.routeDefs.find(routeDef => routeDef.route === toRoute); // {route, routeParsed, funcs}
    const toFuncs = !!toRouteDef ? toRouteDef.funcs : [];
    this.def(fromRoute, ...toFuncs); // assign destination functions to the new route
    return this;
  }


  /**
   * Define special route <notfound>
   * @param {Function[]} funcs - function which will be executed when route is not matched aginst URI
   * @returns {Router}
   */
  notfound(...funcs) {
    this.def('<notfound>', ...funcs);
    return this;
  }



  /**
   * Define special route <do>
   * @param {Function[]} funcs - function which will be executed on every request, e.g. every exe()
   * @returns {Router}
   */
  do(...funcs) {
    this.def('<do>', ...funcs);
    return this;
  }




  /**
   * Execute the router functions.
   * @returns {Promise<object>}
   */
  async exe() {
    const uriParsed = this.trx.uriParsed; // shop/register/john/23

    /*** FIND ROUTE ***/
    // found route definition
    const routeDef_found = this.routeDefs.find(routeDef => { // {route, routeParsed, funcs}
      const routeParsed = routeDef.routeParsed; // {full, segments, base}
      return this._routeRegexMatchNoParams(routeParsed, uriParsed) || this._routeWithParamsMatch(routeParsed, uriParsed);
    });

    // not found route definition
    const routeDef_notfound = this.routeDefs.find(routeDef => routeDef.route === '<notfound>');

    // do route definition
    const routeDef_do = this.routeDefs.find(routeDef => routeDef.route === '<do>');

    /*** EXECUTE FOUND ROUTE FUNCTIONS */
    if (!!routeDef_found) {
      this.trx.routeParsed = routeDef_found.routeParsed;
      this.trx.query = uriParsed.queryObject;
      this.trx.params = !!this.trx.routeParsed ? this._getParams(routeDef_found.routeParsed.full, uriParsed.path) : {};

      for (const func of routeDef_found.funcs) { await func(this.trx); }
    } else if (!!routeDef_notfound) {
      for (const func of routeDef_notfound.funcs) { await func(this.trx); }
    }


    if (!!routeDef_do && !!routeDef_do.funcs && !!routeDef_do.funcs.length) {
      for (const func of routeDef_do.funcs) { await func(this.trx); }
    }


    return this.trx;
  }





  /*********** ROUTE MATCHES  ***********/

  /**
   * Route regular expression match against the uri. Parameters are not defined in the route e.g. there is no /: chars.
   * For example:
   *       (route) /ads/autos/bmw - (uri) /ads/autos/bmw -> true
   *       (route) /ads/a.+s/bmw  - (uri) /ads/autos/bmw -> true
   * @param {object} routeParsed - {full, segments, base}
   * @param {object} uriParsed - {path, segments, queryString, queryObject}
   * @returns {boolean}
   */
  _routeRegexMatchNoParams(routeParsed, uriParsed) {
    const routeReg = new RegExp(`^${routeParsed.full}$`, 'i');
    const tf1 = routeReg.test(uriParsed.path); // route must match uri
    const tf2 = routeParsed.segments === uriParsed.segments; // route and uri must have same number of segments
    const tf = tf1 && tf2;
    if (this.routerOpts.debug) { console.log(`\n_routeRegexMatchNoParams:: (route) ${routeParsed.full} - (uri) ${uriParsed.path} -> ${tf}`); }
    return tf;
  }


  /**
   * Route with parameters match against the uri.
   * (route) /shop/register/:name/:age - (uri) /shop/register/john/23
   * @param {object} routeParsed - {full, segments, base}
   * @param {object} uriParsed - {path, segments, queryString, queryObject}
   * @returns {boolean}
   */
  _routeWithParamsMatch(routeParsed, uriParsed) {
    const routeReg = new RegExp(`^${routeParsed.base}\/`, 'i');
    const tf1 = routeReg.test(uriParsed.path); // route base must match uri
    const tf2 = routeParsed.segments === uriParsed.segments; // route and uri must have same number of segments
    const tf3 = /\/\:/.test(routeParsed.full); // route must have at least one /:
    const tf = tf1 && tf2 && tf3;
    if (this.routerOpts.debug) { console.log(`_routeWithParamsMatch:: (route) ${routeParsed.full} - (uri) ${uriParsed.path} -> ${tf}`); }
    return tf;
  }




  /*********** HELPERS  ***********/

  /**
   * Removing slashes from the beginning and the end.
   * /ads/autos/bmw/ --> ads/autos/bmw
   * //ads/autos/bmw/// --> ads/autos/bmw
   * @param {string} path - uri path or route
   * @returns {string}
   */
  _removeSlashes(path) {
    return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(str) {
      try { JSON.parse(str); }
      catch(err) { return false; }
      return true;
    }

    if (!!value && !isNaN(value) && value.indexOf('.') === -1) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && value.indexOf('.') !== -1) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    return value;
  }



  /**
   * Create query object from query string.
   * @param  {string} queryString - x=abc&y=123&z=true
   * @return {object}             - {x: 'abc', y: 123, z: true}
   */
  _toQueryObject(queryString) {
    const queryArr = queryString.split('&');
    const queryObject = {};

    let eqParts, property, value;
    queryArr.forEach(elem => {
      eqParts = elem.split('='); // equotion parts
      property = eqParts[0];
      value = eqParts[1];

      value = this._typeConvertor(value); // t y p e   c o n v e r s i o n

      queryObject[property] = value;
    });

    return queryObject;
  }



  /**
   * URI parser
   * @param  {string} uri - /shop/register/john/23?x=abc&y=123&z=true  (uri === trx.uri)
   * @returns {path:string, queryString:string, queryObject:object} - {path: 'shop/register/john/23', queryString: 'x=abc&y=123&z=true', queryObject: {x: 'abc', y: 123, z: true}}
   */
  _uriParser(uri) {
    const uriDivided = uri.split('?');

    const path = this._removeSlashes(uriDivided[0]); // /shop/register/john/23 -> shop/register/john/23
    const segments = path.split('/').length;
    const queryString = uriDivided[1];
    const queryObject = !!queryString ? this._toQueryObject(queryString) : {};

    const uriParsed = {path, segments, queryString, queryObject};
    return uriParsed;
  }


  /**
   * Route parser.
   * Converts route string into the parsed object {full, segments, parser} which is used for matching against the URI.
   * @param  {string} route - /shop/register/:name/:age/
   * @returns {full:string, segments:number, base:string} - {full: 'shop/register/:name/:age', segments: 4, base: 'shop/register'}
   */
  _routeParser(route) {
    const full = this._removeSlashes(route);
    const segments = full.split('/').length;
    const base = full.replace(/\/\:.+/, ''); // shop/register/:name/:age --> shop/register

    const routeParsed = {full, segments, base};
    return routeParsed;
  }



  /**
   * Create parameters object.
   * For example if route is /register/:name/:age AND uri is /register/john/23 then params is {name: 'john', age: 23}
   * @param  {string} routeParsedFull - routeParsed.full -- shop/register/:name/:age
   * @param  {string} uriParsedPath  - uriParsed.path -- shop/register/john/23
   * @returns {object}
   */
  _getParams(routeParsedFull, uriParsedPath) {
    const routeParts = routeParsedFull.split('/'); // ['shop', 'register', ':name', ':age']
    const uriParts = uriParsedPath.split('/'); // ['shop', 'register', 'john', 23]

    const params = {};

    routeParts.forEach((routePart, index) => {
      if (/\:/.test(routePart)) {
        const property = routePart.replace(/^\:/, ''); // remove :

        let value = uriParts[index];
        value = this._typeConvertor(value); // t y p e   c o n v e r s i o n

        params[property] = value;
      }
    });

    return params;
  }





}




// NodeJS
if (typeof module !== 'undefined') {
  module.exports = Router;
}

// Browser
if (typeof window !== 'undefined') {
  window.regochRouter = Router;
}

},{}],13:[function(require,module,exports){
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

},{"./Cookie":15,"./Form":16,"./HTTPClient":17,"./Load":18,"./Parse":19,"./eventEmitter":21,"./router":23,"./util":24}],14:[function(require,module,exports){
const Parse = require('./Parse');


class Controller extends Parse {

  constructor() {
    super();
  }


  /************* CONTROLLER LIFECYCLE HOOKS ***********/
  /**
   * Run before render of the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async prerender(trx) {}


  /**
   * Render the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async render(trx) {
    this.parseListeners();
    this.parseNonListeners();
  }

  async parseListeners() {
    this.rgHref();
    this.rgClick();
    this.rgChange();
    this.rgEvt();
    this.rgSet();
  }

  async parseNonListeners() {
    this.rgPrint();
    this.rgClass();
    this.rgStyle();
    this.rgIf();
    this.rgSwitch();
    this.rgFor();
    this.rgRepeat();
    this.rgElem();
  }


  /**
   * Run after render of the HTML elements with data-rg-... attribute. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async postrender(trx) {}


  /**
   * Init the controller. This is where controller logic starts. (see Router.js)
   * @param {object} trx - regoch router transitional variable (defined in Router.js::testRoutes())
   * @returns {Promise<void>}
   */
  async init(trx) {}


  /**
   * Destroy the controller when the data-rg-href element is clicked (see parse.href()).
   * - remove all data-rg-... element lsiteners
   * * @param {HTMLElement} elem - element with data-rg-href which caused controller destruction
   * * @param {Event} event - event (usually click) which was applied on the elem and cause controller destruction
   * @returns {Promise<void>}
   */
  async destroy(elem, event) {}





  /********** MISC **********/
  isHtmlLoaded() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('HTML document is loaded.');
      console.log(document.readyState); // loading, interactive, complete
    });
  }

  isLoaded() {
    window.onload = () => {
      console.log('HTML document and CSS, JS, images and other resources are loaded.');
      console.log(document.readyState);
    };
  }


}

module.exports = Controller;

},{"./Parse":19}],15:[function(require,module,exports){
/**
interface CookieOpts {
  domain?: string;
  path?: string;
  expires?: number | Date; // number of days or exact date
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string; // 'strict' for GET and POST, 'lax' only for POST
}
 */

class Cookie {

  /**
   * @param {CookieOpts} cookieOpts - cookie options
   * @param {boolean} debug - show debug info
   */
  constructor(cookieOpts, debug) {
    this.cookieOpts = cookieOpts;
    this.debug = debug;
  }


  /**
   * Set cookie. Cookie value is string.
   * @param {string} name - cookie name
   * @param {string} value - cookie value (string)
   * @returns {void}
   */
  put(name, value) {
    if (!document) { throw new Error('The document is not available.'); }

    // encoding cookie value
    const valueStr = encodeURIComponent(value); // a b --> a%20b

    // name=value;
    let cookieStr = `${name}=${valueStr};`;

    // add cookie options: domain, path, expires, secure, HttpOnly, SameSite
    cookieStr = this._appendCookieOptions(cookieStr);
    document.cookie = cookieStr;

    if (this.debug) { console.log('cookie-put():cookieStr: ', cookieStr); }
  }



  /**
   * Set cookie. Cookie value is object.
   * @param {string} name - cookie name
   * @param {object} valueObj - cookie value (object)
   * @returns {void}
   */
  putObject(name, valueObj) {
    if (!document) { throw new Error('The document is not available.'); }

    // convert object to string and encode that string
    const valueStr = encodeURIComponent(JSON.stringify(valueObj)); // a b --> a%20b

    // name=value;
    let cookieStr = `${name}=${valueStr};`;

    // add cookie options: domain, path, expires, secure, HttpOnly, SameSite
    cookieStr = this._appendCookieOptions(cookieStr);
    document.cookie = cookieStr;

    if (this.debug) { console.log('cookie-putObject(): ', cookieStr); }
  }



  /**
   * Get all cookies in string format (cook1=jedan1; cook2=dva2;).
   * @returns {string} - example: cook1=jedan1; cook2=dva2;
   */
  getAll() {
    if (!document) { throw new Error('The document is not available.'); }
    const allCookies = document.cookie; // 'cook1=jedan1; cook2=dva2;'
    if (this.debug) { console.log('cookie-getAll(): ', allCookies);}
    return allCookies;
  }



  /**
   * Get a cookie by specific name. Returned value is string.
   * @param {string} name - cookie name
   * @returns {string}
   */
  get(name) {
    if (!document) { throw new Error('The document is not available.'); }

    const cookiesArr = this._toCookiesArr(); // ["authAPIInit1=jedan1", "authAPIInit2=dva2", "authAPI="]

    // extract cookie value for specific name
    let elemArr, cookieVal;
    cookiesArr.forEach(elem => {
      elemArr = elem.split('='); // ["authAPIInit1", "jedan1"]
      if (elemArr[0] === name) {
        cookieVal = elemArr[1];
      }
    });

    cookieVal = decodeURIComponent(cookieVal); // a%20b --> a b

    // debug
    if (this.debug) {
      console.log('cookie-get()-cookiesArr: ', cookiesArr);
      console.log('cookie-get()-cookieVal: ', name, '=', cookieVal);
    }

    return cookieVal;
  }



  /**
   * Get cookie by specific name. Returned value is object.
   * @param {string} name - cookie name
   * @returns {object}
   */
  getObject(name) {
    if (!document) { throw new Error('The document is not available.'); }

    const cookieVal = this.get(name); // %7B%22jen%22%3A1%2C%22dva%22%3A%22dvica%22%7D

    // convert cookie string value to object
    let cookieObj = null;
    try {
      if (cookieVal !== 'undefined' && !!cookieVal) {
        const cookieJson = decodeURIComponent(cookieVal);
        cookieObj = JSON.parse(cookieJson);
      }
    } catch (err) {
      console.error('cookie-getObject(): ', err);
    }

    // debug
    if (this.debug) {
      console.log('cookie-getObject():cookieVal: ', cookieVal);
      console.log('cookie-getObject():cookieObj: ', cookieObj);
    }

    return cookieObj;
  }



  /**
   * Remove cookie by specific name.
   * @param {string} name - cookie name
   * @returns {void}
   */
  remove(name) {
    if (!document) { throw new Error('The document is not available.'); }
    let dateOld = new Date('1970-01-01T01:00:00'); // set expires backward to delete cookie
    dateOld = dateOld.toUTCString(); // Thu, 01 Jan 1970 00:00:00 GMT
    document.cookie = `${name}=;expires=${dateOld};path=/;`;
    if (this.debug) { console.log('cookie-remove(): ', name, ' cookie is deleted.'); }
  }



  /**
   * Remove all cookies.
   * @returns {void}
   */
  removeAll() {
    if (!document) { throw new Error('The document is not available.'); }

    // set expires backward to delete cookie
    let dateOld = new Date('1970-01-01T01:00:00'); // set expires backward to delete cookie
    dateOld = dateOld.toUTCString(); // Thu, 01 Jan 1970 00:00:00 GMT

    // get cookies array
    const cookiesArr = this._toCookiesArr(); // ["authAPIInit1=jedan1", "authAPIInit2=dva2", "authAPI="]

    // extract cookie value for specific name
    let elemArr;
    const cookiesArr2 = [];
    cookiesArr.forEach(elem => {
      elemArr = elem.split('='); // ["authAPIInit1", "jedan1"]
      document.cookie = `${elemArr[0]}=;expires=${dateOld};path=/;`;
      cookiesArr2.push(document.cookie);
    });

    // debug
    if (this.debug) {
      console.log('cookie-removeAll():before:: ', cookiesArr);
      console.log('cookie-removeAll():after:: ', cookiesArr2);
    }
  }



  /**
   * Empty cookie value by specific name.
   * @param {string} name - cookie name
   * @returns {void}
   */
  empty(name) {
    if (!document) { throw new Error('The document is not available.'); }
    document.cookie = `${name}=;`; // empty cookie value
    if (this.debug) { console.log('cookie-empty(): ', name); }
  }



  /**
   * Check if cookie exists.
   * @param {string} name - cookie name
   * @return boolean
   */
  exists(name) {
    if (!document) { throw new Error('The document is not available.'); }

    const cookiesArr = this._toCookiesArr(); // ["authAPIInit1=jedan1", "authAPIInit2=dva2", "authAPI="]

    // extract cookie value for specific name
    let elemArr, cookieExists = false;
    cookiesArr.forEach(elem => {
      elemArr = elem.split('='); // ["authAPIInit1", "jedan1"]
      if (elemArr[0] === name) {
        cookieExists = true;
      }
    });

    if (this.debug) { console.log('cookie-exists(): ', cookieExists); }

    return cookieExists;
  }



  /******* PRIVATES *******/
  /**
   * Add cookie options (domain, path, expires, secure, ...) to the cookie string.
   * @param {string} cookieStr - cookie string
   * @returns {string}
   */
  _appendCookieOptions(cookieStr) {

    if (!this.cookieOpts) {
      return cookieStr;
    }

    // domain=example.com;
    if (!!this.cookieOpts.domain) {
      const cDomain = `domain=${this.cookieOpts.domain};`;
      cookieStr += cDomain;
    }

    // path=/;
    if (!!this.cookieOpts.path) {
      const cPath = `path=${this.cookieOpts.path};`;
      cookieStr += cPath;
    }

    // expires=Fri, 3 Aug 2001 20:47:11 UTC;
    if (!!this.cookieOpts.expires) {
      let expires;
      if (typeof this.cookieOpts.expires === 'number') {
        const d = new Date();
        d.setTime(d.getTime() + (this.cookieOpts.expires * 24 * 60 * 60 * 1000));
        expires = d.toUTCString();
      } else {
        expires = this.cookieOpts.expires.toUTCString();
      }
      const cExpires = `expires=${expires};`;

      cookieStr += cExpires;
    }

    // secure;
    if (!!this.cookieOpts.secure) {
      const cSecure = 'secure;';
      cookieStr += cSecure;
    }

    // HttpOnly;
    if (!!this.cookieOpts.httpOnly) {
      const cHttpOnly = 'HttpOnly;';
      cookieStr += cHttpOnly;
    }

    // SameSite=lax; or SameSite=strict;
    if (!!this.cookieOpts.sameSite) {
      const cSameSite = `SameSite=${this.cookieOpts.sameSite};`;
      cookieStr += cSameSite;
    }

    return cookieStr;
  }



  /**
   * Get all cookies from document.cookie and convert it in the array format.
   * authAPIInit1=jedan1; authAPIInit2=dva2; authAPI=  --> ["authAPIInit1=jedan1", "authAPIInit2=dva2", "authAPI="]
   * @returns {string[]}
   */
  _toCookiesArr() {
    // fetch all cookies
    const allCookies = document.cookie; // authAPIInit1=jedan1; authAPIInit2=dva2; authAPI=

    // create cookie array
    const cookiesArr = allCookies.split(';'); // ["authAPIInit1=jedan1", " authAPIInit2=dva2", " authAPI="]

    // remove empty spaces from left and right side
    const cookiesArrMapped = cookiesArr.map(cookiesPair => { // cookiesPair: " authAPIInit2=dva2"
      return cookiesPair.trim();
    });

    return cookiesArrMapped; // ["authAPIInit1=jedan1", "authAPIInit2=dva2", "authAPI="]
  }



}


module.exports = Cookie;

},{}],16:[function(require,module,exports){
/**
 * HTML Form Library
 * According to W3C Standard https://html.spec.whatwg.org/multipage/forms.html
 */
const debug = require('./debug');



class Form {

  constructor(formName) {
    this.formName = formName;
  }


  /**
   * Set the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   * @param {any|string[]} val - the value
   */
  setControl(key, val) {
    debug('setControl', '--------- setControl ------', 'green', '#A1F8DC');
    debug('setControl', `${key} = ${val}`, 'green');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        elem.checked = false;
        if (val.indexOf(elem.value) !== -1) { elem.checked = true; } // val is array
      } else if (elem.type === 'select-multiple') {
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
          if (val.indexOf(option.value) !== -1) { option.selected = true; }  // val is array
        }
      } else if (elem.type === 'radio') {
        elem.checked = false;
        if (val === elem.value) { elem.checked = true; }
      } else {
        elem.value = val; // val is not array
      }
    }

  }


  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   */
  getControl(key) {
    debug('getControl', '--------- getControl ------', 'green', '#A1F8DC');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    let val;
    const valArr = [];
    let i = 1;
    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        if (elem.checked) { valArr.push(elem.value); val = valArr; }
        if (i === elems.length && !val) { val = []; }
      } else if (elem.type === 'select-multiple') {
        const opts = elem.selectedOptions; // selected options
        for (const opt of opts) {
          valArr.push(opt.value);
          val = valArr;
        }
        if (i === elems.length && !val) { val = []; }
      } else if (elem.type === 'radio') {
        if (elem.checked) { val = elem.value; }
      } else if (elem.type === 'number') {
        val = elem.valueAsNumber;
      } else {
        val = elem.value;
      }
      i++;
    }

    debug('getControl', `${val}`, 'green');
    return val;
  }


  /**
   * Get the form control value.
   * @param {string} key - the value of the "name" HTML attribute
   */
  delControl(key) {
    debug('delControl', '--------- delControl ------', 'green', '#A1F8DC');
    debug('delControl', key, 'green');
    const elems = document.querySelectorAll(`form[data-rg-form="${this.formName}"] [name="${key}"]`);
    if (!elems.length) { throw new Error(`Form "${this.formName}" doesn't have "${key}" control.`); }

    for (const elem of elems) {
      if (elem.type === 'checkbox') {
        elem.checked = false;
      } else if (elem.type === 'select-multiple') {
        const options = elem; // all options
        for (const option of options) {
          option.selected = false;
        }
      } else if (elem.type === 'radio') {
        elem.checked = false;
      } else {
        elem.value = '';
      }
    }

  }



  /********** MISC *********/
  /**
   * Debugger. Use it as debug(var1, var2, var3)
   * @returns {void}
   */
  debugger(tip, text, color, background) {
    if (this.debug[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
  }





}

module.exports = Form;

},{"./debug":20}],17:[function(require,module,exports){
class HTTPClient {

  /**
   * @param {Object} opts - HTTP Client options {encodeURI, timeout, retry, retryDelay, maxRedirects, headers}
   */
  constructor(opts) {
    this.url;
    this.protocol = 'http:';
    this.hostname = '';
    this.port = 80;
    this.pathname = '/';
    this.queryString = '';

    if (!opts) {
      this.opts = {
        encodeURI: false,
        timeout: 8000,
        retry: 3,
        retryDelay: 5500,
        maxRedirects: 3,
        headers: {
          'authorization': '',
          'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          'content-type': 'text/html; charset=UTF-8'
        }
      };
    } else {
      this.opts = opts;
    }

    // default request headers
    this.headers = this.opts.headers;

    // init the xhr
    this.xhr = new XMLHttpRequest();
  }



  /********** PRIVATES *********/

  /**
   * Parse url.
   * @param {String} url - http://www.adsuu.com/some/thing.php?x=2&y=3
   */
  _parseUrl(url) {
    url = this._correctUrl(url);
    const urlObj  = new URL(url);
    this.url = url;
    this.protocol = urlObj.protocol;
    this.hostname = urlObj.hostname;
    this.port = urlObj.port;
    this.pathname = urlObj.pathname;
    this.queryString = urlObj.search;

    // debug
    /*
    console.log('this.url:: ', this.url); // http://localhost:8001/www/products?category=databases
    console.log('this.protocol:: ', this.protocol); // http:
    console.log('this.hostname:: ', this.hostname); // localhost
    console.log('this.port:: ', this.port); // 8001
    console.log('this.pathname:: ', this.pathname); // /www/products
    console.log('this.queryString:: ', this.queryString); // ?category=databases
    */

    return url;
  }


  /**
   * URL corrections
   */
  _correctUrl(url) {
    if (!url) {throw new Error('URL is not defined'); }

    // 1. trim from left and right
    url = url.trim();

    // 2. add protocol
    if (!/^https?:\/\//.test(url)) {
      url = 'http://' + url;
    }

    // 3. remove multiple empty spaces and insert %20
    if (this.opts.encodeURI) {
      url = encodeURI(url);
    } else {
      url = url.replace(/\s+/g, ' ');
      url = url.replace(/ /g, '%20');
    }

    return url;
  }


  /**
   * Beautify error messages.
   * @param {Error} error - original error
   * @return formatted error
   */
  _formatError(error, url) {
    // console.log(error);
    const err = new Error(error);


    // reformatting NodeJS errors
    if (error.code === 'ENOTFOUND') {
      err.status = 400;
      err.message = `400 Bad Request [ENOTFOUND] ${url}`;
    } else {
      err.status = error.status || 400;
      err.message = error.message;
    }

    err.original = error;

    return err; // formatted error is returned
  }


  /**
   * Get current date/time
   */
  _getTime() {
    const d = new Date();
    return d.toISOString();
  }


  /**
   * Get time difference in seconds
   */
  _getTimeDiff(start, end) {
    const ds = new Date(start);
    const de = new Date(end);
    return (de.getTime() - ds.getTime()) / 1000;
  }



  /********** REQUESTS *********/

  /**
   * Sending one HTTP request to HTTP server.
   *  - 301 redirections are not handled.
   *  - retries are not handled
   * @param {string} url - https://www.example.com/something?q=15
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {any} body_obj - http body payload
   * @returns {Promise<any>}
   */
  askOnce(url, method = 'GET', body_obj) {

    // answer (response object)
    const answer = {
      requestURL: url,
      requestMethod: method,
      status: 0,
      statusMessage: '',
      https: false,
      req: {
        headers: this.headers,
        payload: undefined
      },
      res: {
        headers: undefined,
        content: undefined
      },
      time: {
        req: this._getTime(),
        res: undefined,
        duration: undefined
      }
    };


    // check and correct URL
    try {
      url = this._parseUrl(url);
      answer.requestURL = url;
      answer.https = /^https/.test(this.protocol);
    } catch (err) {
      // if URL is not properly defined
      const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
      ans.status = 400; // client error - Bad Request
      ans.statusMessage = err.message || 'Bad Request';
      ans.time.res = this._getTime();
      ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

      return ans; // send answer and stop further execution
    }



    /*** 1) init HTTP request ***/
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
    this.xhr.open(method, url, true, null, null);

    // set the options
    this.xhr.timeout = this.opts.timeout;
    Object.keys(this.opts.headers).forEach(prop => this.xhr.setRequestHeader(prop, this.opts.headers[prop]));

    /*** 2) add body to HTTP request ***/
    if (!!body_obj && !/GET/i.test(method)) {
      answer.req.payload = body_obj;
      const body_str = JSON.stringify(body_obj);
      this.headers['content-length'] = body_str.length;
    }

    /*** 3) send request to server ***/
    this.xhr.send();

    /** 4) wait for response */
    const promise = new Promise ((resolve, reject) => {

      this.xhr.onload = res => {
        const content = res.target.response;

        // format answer
        const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
        ans.status = this.xhr.status; // 2xx -ok response, 4xx -client error (bad request), 5xx -server error
        ans.statusMessage = this.xhr.statusText;
        ans.res.headers = this.getResHeaders();
        ans.res.content = content;
        ans.time.res = this._getTime();
        ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);


        resolve(ans);
      };


      this.xhr.onerror = error => {
        this.kill();
        const err = this._formatError(error, url);

        // format answer
        const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
        ans.status = err.status;
        ans.statusMessage = err.message;
        ans.time.res = this._getTime();
        ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

        // do not resolve if it's already resolved by timeout
        resolve(ans);
      };


      this.xhr.ontimeout = () => {
        this.kill();

        // format answer
        const ans = {...answer}; // clone object to prevent overwrite of object properies once promise is resolved
        ans.status = 408; // 408 - timeout
        ans.statusMessage = `Request aborted due to timeout (${this.opts.timeout} ms) ${url} `;
        ans.time.res = this._getTime();
        ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

        resolve(ans);
      };

    });

    return promise;

  }



  /**
   * Sending HTTP request to HTTP server.
   *  - 301 redirections are handled.
   *  - retries are handled
   * @param {String} url - https://www.example.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object} body_obj - http body
   */
  async ask(url, method = 'GET', body_obj) {

    let answer = await this.askOnce(url, method, body_obj);
    const answers = [answer];


    /*** a) HANDLE 3XX REDIRECTS */
    let redirectCounter = 1;

    while (!!answer && /^3\d{2}/.test(answer.status) && redirectCounter <= this.opts.maxRedirects) { // 300, 301, 302, ...

      const url_new = new URL(url, answer.res.headers.location); // redirected URL is in 'location' header
      console.log(`#${redirectCounter} redirection ${answer.status} from ${this.url} to ${url_new}`);

      answer = await this.askOnce(url_new, method, body_obj); // repeat request with new url
      answers.push(answer);

      redirectCounter++;
    }



    /*** b) HANDLE RETRIES when status = 408 timeout */
    let retryCounter = 1;

    while (answer.status === 408 && retryCounter <= this.opts.retry) {
      console.log(`#${retryCounter} retry due to timeout (${this.opts.timeout}) on ${url}`);
      await new Promise(resolve => setTimeout(resolve, this.opts.retryDelay)); // delay before retrial

      answer = await this.askOnce(url, method, body_obj);
      answers.push(answer);


      retryCounter++;
    }



    return answers;

  }



  /**
   *
   * @param {string} url - https://api.example.com/someurl
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {object|string} body - http body as Object or String type
   * @returns {Promise<string>}
   */
  async askJSON(url, method = 'GET', body) {

    // convert body string to object
    let body_obj = body;
    if (typeof body === 'string') {
      try {
        body_obj = JSON.parse(body);
      } catch (err) {
        throw new Error('Body string is not valid JSON.');
      }
    }

    // JSON request headers
    this.setHeaders({
      'content-type': 'application/json; charset=utf-8',
      'accept': 'application/json'
    });

    const answer = await this.askOnce(url, method, body_obj);

    // convert content string to object
    if (!!answer.res.content) {
      try {
        answer.res.content = JSON.parse(answer.res.content);
      } catch (err) {
        throw new Error('Response content is not valid JSON.');
      }
    }

    return answer;

  }


  /**
   * Get whole HTML file or part marked with css selector.
   * Notice that returned value is HTML DOM object.
   * @param {string} url - http://example.com/page.html
   * @param {string} cssSel - css selector: div>p.alert
   * @returns {Promise<{dom:DocumentFragment|HTMLElement, str:string}>}
   */
  async askHTML(url, cssSel) {
    const answer = await this.askOnce(url);
    const range = document.createRange();
    const frag = range.createContextualFragment(answer.res.content);

    // take part of the HTML
    let dom;
    let str = '';
    if (!cssSel) {
      dom = frag; // DocumentFragment
      dom.childNodes.forEach(node => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        if (node.nodeType === 1) { str += node.outerHTML; }
        else if (node.nodeType === 3){ str += node.data; }
      });
    } else {
      dom = frag.querySelector(cssSel); // HTMLElement
      str = dom.outerHTML;
    }

    answer.res.content = {dom, str};
    return answer;
  }



  /**
   * Stop the sent request.
   */
  kill() {
    this.xhr.abort();
  }





  /********** HEADERS *********/

  /**
   * Change header object.
   * Previously defined this.headers properties will be overwritten.
   * @param {Object} headerObj - {'authorization', 'user-agent', accept, 'cache-control', 'host', 'accept-encoding', 'connection'}
   */
  setHeaders(headerObj) {
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Set (add/update) header.
   * Previously defined header will be overwritten.
   * @param {String} headerName - 'content-type'
   * @param {String} headerValue - 'text/html; charset=UTF-8'
   */
  setHeader(headerName, headerValue) {
    const headerObj = {[headerName]: headerValue};
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Change header object.
   * @param {Array} headerNames - array of header names    ['content-type', 'accept']
   */
  delHeaders(headerNames) {
    headerNames.forEach(headerName => {
      delete this.headers[headerName];
    });
  }


  /**
   * Get request headers
   */
  getReqHeaders() {
    return this.headers;
  }


  /**
   * Get response headers.
   */
  getResHeaders() {
    const headersStr = this.xhr.getAllResponseHeaders();
    const headersArr = headersStr.split('\n');
    const headersObj = {};
    headersArr.forEach(headerFull => {
      const splited = headerFull.split(':');
      const prop = splited[0];
      if (prop) {
        const val = splited[1].trim();
        headersObj[prop] = val;
      }
    });
    return headersObj;
  }



}


module.exports = HTTPClient;

},{}],18:[function(require,module,exports){
const viewsCompiled = require('../app/dist/views/compiled.json');
const debug = require('./debug');



class Load {

  constructor(baseURL, httpClient) {
    this.baseURL = baseURL;
    this.hc = httpClient;
  }


  /**
   * Load router views. View depends on routes.
   * @param {string} viewName - view name
   * @param {string} viewPath - view file path (relative to /view directory)
   * @param {string} cssSel - CSS selector to load part of the view file
   * @param {string} dest - destination where to place the view: inner, outer, sibling, prepend, append
   * @returns
   */
  async view(viewName, viewPath, cssSel, dest) {
    const attrSel = `[data-rg-view="${viewName}"]`;

    // get HTML element
    const elem = document.querySelector(attrSel);
    debug('loadView', `--------- loadView ${attrSel} -- ${viewPath} ---------`, '#8B0892', '#EDA1F1');
    if(debug().loadView) { console.log('elem::', elem); }
    if (!elem || !viewPath) { return; }



    // Get HTML content. First try from the compiled JSON and if it doesn't exist then request from the server.
    let contentStr, contentDOM;
    if (!!viewsCompiled[viewPath]) { // HTML content from the variable
      contentStr = viewsCompiled[viewPath];

      // convert HTML string to document-fragment object
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentStr, 'text/html');
      if (!cssSel) {
        contentDOM = doc; // Document
      } else {
        contentDOM = doc.querySelector(cssSel); // HTMLElement
      }

      debug('loadView', '--from compiled JSON', '#8B0892');

    } else { // HTML content by requesting the server
      const path = `/views/${viewPath}`;
      const url = new URL(path, this.baseURL).toString(); // resolve the URL
      const answer = await this.hc.askHTML(url, cssSel);
      const content = answer.res.content;
      if (answer.status !== 200 || !content) { return; }

      // convert answer's content from dom object to string
      contentStr = answer.res.content.str; // string
      contentDOM = answer.res.content.dom; // DocumentFragment | HTMLElement|HTMLButtonElement...

      debug('loadView', '--from server', '#8B0892');
    }


    if(debug().loadView) { console.log('contentStr::', contentStr); }
    if(debug().loadView) { console.log('contentDOM::', contentDOM); }


    // load content in the element
    if (dest === 'inner') {
      elem.innerHTML = contentStr;
    } else if (dest === 'outer') {
      elem.outerHTML = contentStr;
    } else if (dest === 'sibling') {
      const parent = elem.parentNode;
      const sibling = elem.nextSibling;
      if (sibling.isEqualNode(contentDOM)) { sibling.replaceWith(contentDOM); }
      else { parent.insertBefore(contentDOM, sibling); }
    } else if (dest === 'prepend') {
      const firstChild = elem.firstChild;
      const emptyNode = document.createTextNode('');
      if (firstChild.isEqualNode(contentDOM)) { firstChild.replaceWith(emptyNode); }
      elem.prepend(contentDOM);
    } else if (dest === 'append') {
      const lastChild = elem.lastChild;
      const emptyNode = document.createTextNode('');
      if (lastChild.isEqualNode(contentDOM)) { lastChild.replaceWith(emptyNode); }
      elem.append(contentDOM);
    } else {
      elem.innerHTML = contentStr;
    }

    return {elem, contentStr, contentDOM, document};
  }




}




module.exports = Load;

},{"../app/dist/views/compiled.json":1,"./debug":20}],19:[function(require,module,exports){
const eventEmitter = require('./eventEmitter');
const debug = require('./debug');



/**
 * Parse HTML elements with the "data-rg-" attribute
 */
class Parse {

  constructor() {
    this.dataRgs = []; // [{attrName, elem, handler}] -- attribute name, element with the data-rg-... attribute and its corresponding handler
    this.separator = '@@';
    this.temp = {}; // controller temporary variable (exists untill controller exists)
  }

  /************************ LISTENERS  ************************/

  /**
   * Remove all listeners (click, input, ...) from the elements with the "data-rg-..." attribute
   */
  async rgKILL() {
    debug('rgKILL', '------- rgKILL -------', 'orange', '#FFD8B6');

    const promises = [];
    let i = 1;
    for (const dataRg of this.dataRgs) {
      dataRg.elem.removeEventListener(dataRg.eventName, dataRg.handler);
      debug('rgKILL', `${i}. killed:: ${dataRg.attrName} --- ${dataRg.eventName} --- ${dataRg.elem.innerHTML}`, 'orange');
      promises.push(Promise.resolve(true));
      i++;
    }

    await Promise.all(promises);
    this.dataRgs = [];
  }



  /**
   * data-rg-href
   * <a href="/product/12" data-rg-href>Product 12</a>
   * Href listeners and changing URLs (browser history states).
   * NOTICE: Click on data-rg-href element will destroy the controller.
   * @returns {void}
   */
  rgHref() {
    debug('rgHref', '--------- rgHref ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-href';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {

      const handler = async event => {
        event.preventDefault();

        // destroy the current controller and kill the event listeners
        await this.destroy(elem, event);
        this.rgKILL();

        // push state and change browser's address bar
        const href = elem.getAttribute('href').trim();
        const state = { href };
        const title = elem.getAttribute(attrName).trim();
        const url = href; // new URL in the browser's address bar
        window.history.pushState(state, title, url);

        // fire event and test routes
        eventEmitter.emit('pushstate', state);
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler, eventName: 'click'});
      debug('rgHref', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${elem.localName}`, 'orange');

    }
  }



  /**
   * data-rg-click="<function>"
   * data-rg-click="myFunc()"
   * Listen for click and execute the function i.e. controller method.
   * @returns {void}
   */
  rgClick() {
    debug('rgClick', '--------- rgClick ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-click';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'myFunc(x, y, ...restArgs)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1]; // function name: myFunc

      const handler = event => {
        event.preventDefault();
        try {
          const funcArgs = this._getFuncArgs(matched[2], elem, event);
          if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
          this[funcName](...funcArgs);
          debug('rgClick', `${funcName} | ${funcArgs}`, 'orange');
        } catch (err) {
          throw new Error(err.message);
        }
      };

      elem.addEventListener('click', handler);
      this.dataRgs.push({attrName, elem, handler, eventName: 'click'});
      debug('rgClick', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName}`, 'orange');
    }

  }


  /**
   * data-rg-change="<function>"
   * data-rg-change="myFunc()"
   * Listen for change and execute the function i.e. controller method.
   * @returns {void}
   */
  rgChange() {
    debug('rgChange', '--------- rgChange ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-change';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const funcDef = elem.getAttribute(attrName).trim(); // string 'myFunc(x, y, ...restArgs)'
      const matched = funcDef.match(/^(.+)\((.*)\)$/);
      const funcName = matched[1]; // function name: myFunc

      const handler = event => {
        event.preventDefault();
        try {
          const funcArgs = this._getFuncArgs(matched[2], elem, event);
          if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
          this[funcName](...funcArgs);
          debug('rgChange', `${funcName} | ${funcArgs}`, 'orange');
        } catch (err) {
          throw new Error(err.message);
        }
      };

      elem.addEventListener('change', handler);
      this.dataRgs.push({attrName, elem, handler, eventName: 'change'});
      debug('rgChange', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName}`, 'orange');
    }

  }


  /**
   * data-rg-evt="<function>"
   * Listen for event and execute the function i.e. controller method.
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event
   * Examples:
   * data-rg-evt="mouseenter @@ myFunc($element, $event, 25, 'some text')"  - $element and $event are the DOM objects related to the element
   * @returns {void}
   */
  rgEvt() {
    debug('rgEvt', '--------- rgEvt ------', 'orange', '#FFD8B6');
    const attrName = 'data-rg-evt';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName).trim(); // mouseenter @@ runEVT($element, $event, 'red') && mouseleave @@ runEVT($element, $event, 'green')
      const directives = attrVal.split('&&');

      for (const directive of directives) {
        const attrValSplited = directive.split(this.separator);
        if (!attrValSplited[0] || !attrValSplited[1]) { throw new Error(`Attribute "data-rg-evt" has bad definition (data-rg-evt="${attrVal}").`); }

        const eventName = attrValSplited[0].trim();
        const funcDef = attrValSplited[1].trim();

        const matched = funcDef.match(/^(.+)\((.*)\)$/);
        const funcName = matched[1]; // function name: myFunc

        const handler = event => {
          event.preventDefault();
          try {
            const funcArgs = this._getFuncArgs(matched[2], elem, event);
            if (!this[funcName]) { throw new Error(`Method "${funcName}" is not defined in the "${this.constructor.name}" controller.`); }
            this[funcName](...funcArgs);
            debug('rgEvt', `${funcName} | ${funcArgs}`, 'orange');
          } catch (err) {
            throw new Error(err.message);
          }
        };

        elem.addEventListener(eventName, handler);
        this.dataRgs.push({eventName, attrName, elem, handler, eventName});
        debug('rgEvt', `pushed:: ${this.dataRgs.length} -- ${attrName} -- ${funcName} -- ${eventName}`, 'orange');
      }

    }

  }



  /**
   * data-rg-set="<controllerProperty> [@@ print]"
   * Parse the "data-rg-set" attribute. Sets the controller property in INPUT element.
   * Examples:
   * data-rg-set="product" - product is the controller property
   * data-rg-set="product.name"
   * data-rg-set="product.name @@ print" -> bind to view directly by calling print() method directly
   * @returns {void}
   */
  rgSet() {
    debug('rgSet', '--------- rgSet ------', 'navy', '#B6ECFF');
    const attrName = 'data-rg-set';
    const elems = document.querySelectorAll(`[${attrName}]`);
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const bindTo = !!attrValSplited[1] ? attrValSplited[1].trim() : ''; // 'print'

      const prop = attrValSplited[0].trim(); // controller property name
      const propSplitted = prop.split('.'); // company.name

      const handler = event => {
        // console.log(event);
        let i = 1;
        let obj = this;
        for (const prop of propSplitted) {
          if (i !== propSplitted.length) { obj[prop] = {}; obj = obj[prop]; }
          else { obj[prop] = elem.value; }
          i++;
        }
        if (bindTo === 'print') { this.rgPrint(prop); }
        debug('rgSet', `controller property:: ${prop} = ${obj[prop]}`, 'orange');
      };

      elem.addEventListener('input', handler);
      this.dataRgs.push({attrName, elem, handler, eventName: 'input'});
      debug('rgSet', `pushed::  ${attrName} -- ${elem.localName} --- dataRgs.length: ${this.dataRgs.length}`, 'navy');
    }

  }



  /*************** NON LISTENERS *************/
  /**
   * data-rg-print="<controllerProperty> [@@ inner|outer|sibling|prepend|append]"
   * data-rg-print="company.name @@ inner"
   * Parse the "data-rg-print" attribute. Print the controller's property to view.
   * Examples:
   * data-rg-print="product" - product is the controller property
   * data-rg-print="product.name @@ outer"
   * data-rg-print="product.name @@ sibling"
   * @param {string} attrvalueProp - part of the attribute value which relates to the controller property,
   * for example product.name in the data-rg-print="product.name @@ inner". This speed up parsing because it's limited only to one element.
   * @returns {void}
   */
  rgPrint(attrvalueProp) {
    debug('rgPrint', '--------- rgPrint ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-print';
    if (!attrvalueProp) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalueProp}"`;
    }

    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgPrint', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName);
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      let val = this._getControllerValue(prop);

      // correct val
      val = !!val ? val : '';
      if (typeof val === 'object') { val = JSON.stringify(val); }

      // save temporary initial innerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) { this.temp[tempVarName] = elem.innerHTML; }


      // load content in the element
      let act = attrValSplited[1] || 'inner';
      act = act.trim();
      if (act === 'inner') {
        elem.innerHTML = val;
      } else if (act === 'outer') {
        elem.outerHTML = val;
      } else if (act === 'sibling') {
        const textNode = document.createTextNode(val);
        elem.nextSibling.remove();
        elem.parentNode.insertBefore(textNode, elem.nextSibling);
      } else if (act === 'prepend') {
        elem.innerHTML = val + ' ' + this.temp[tempVarName];
      } else if (act === 'append') {
        elem.innerHTML = this.temp[tempVarName] + ' ' + val;
      } else if (act === 'inset') {
        elem.innerHTML = this.temp[tempVarName].replace('${}', val);
      } else {
        elem.innerHTML = val;
      }

      debug('rgPrint', `${prop}:: ${val} | act::"${act}"`, 'navy');
    }
  }


  /**
   * data-rg-class="<controllerProperty> [@@ add|replace]"
   * Parse the "data-rg-class" attribute. Set element class attribute.
   * Examples:
   * data-rg-class="myKlass" - add new classes to existing classes
   * data-rg-class="myKlass @@ add" - add new classes to existing classes
   * data-rg-class="myKlass @@ replace" - replace existing classes with new classes
   * @param {string} controllerProp - controller property which defines "class" attribute
   * @returns {void}
   */
  rgClass(controllerProp) {
    debug('rgClass', '--------- rgClass ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-class';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgClass', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const ctrlProp = attrValSplited[0].trim();
      const valArr = this[ctrlProp] || []; // ['my-bold', 'my-italic']

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('class'); }
      for (const val of valArr) { elem.classList.add(val); }

      debug('rgClass', `data-rg-class="${attrVal}" --- ctrlProp:: ${ctrlProp} | ctrlVal:: ${valArr} | act:: ${act}`, 'navy');
    }

  }



  /**
   * data-rg-style="<controllerProperty> [@@ add|replace]"
   * Parse the "data-rg-style" attribute. Set element style attribute.
   * Examples:
   * data-rg-style="myStyl" - add new styles to existing sytles
   * data-rg-style="myStyl @@ add" - add new styles to existing sytles
   * data-rg-style="myStyl @@ replace" - replace existing styles with new styles
   * @param {string} controllerProp - controller property which defines "style" attribute
   * @returns {void}
   */
  rgStyle(controllerProp) {
    debug('rgStyle', '--------- rgStyle ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-style';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}^="${controllerProp}"]`); }
    debug('rgStyle', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty'
      const attrValSplited = attrVal.split(this.separator);

      const ctrlProp = attrValSplited[0].trim();
      const valObj = this[ctrlProp] || {}; // {fontSize: '21px', color: 'red'}

      let act = attrValSplited[1] || '';
      act = act.trim() || 'add';

      if (act == 'replace') { elem.removeAttribute('style'); }

      const styleProps = Object.keys(valObj);
      for (const styleProp of styleProps) { elem.style[styleProp] = valObj[styleProp]; }

      debug('rgStyle', `data-rg-style="${attrVal}" --- ctrlProp:: "${ctrlProp}" | styleProps:: "${styleProps}" | act:: "${act}"`, 'navy');
    }

  }



  /**
   * data-rg-if="<controllerProperty> [@@ hide|remove]"
   * Parse the "data-rg-if" attribute. Show or hide the HTML element.
   * Examples:
   * data-rg-if="ifAge" - hide the element
   * data-rg-if="ifAge @@ hide" - hide the element
   * data-rg-if="ifAge @@ remove" - remove the element
   * @param {string} attrvalue - attribute value (limit parsing to only one HTML element)
   * @returns {void}
   */
  rgIf(attrvalue) {
    debug('rgIf', '--------- rgIf ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-if';
    if (!attrvalue) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalue}"`;
    }

    this._uncommentAll();


    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgIf', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // ifAge @@ remove
      const attrValSplited = attrVal.split(this.separator);

      const prop = attrValSplited[0].trim(); // controller property name company.name
      const propSplitted = prop.split('.'); // ['company', 'name']
      const prop1 = propSplitted[0]; // company
      let val = this[prop1]; // controller property value
      let i = 0;
      for (const prop of propSplitted) {
        if (i !== 0 && !!val) { val = val[prop]; }
        i++;
      }

      // show or hide element
      let act = attrValSplited[1] || 'hide'; // hide | remove
      act = act.trim();

      // set data-rg-ifparent
      const parent = elem.parentNode;
      if (act == 'remove') {
        parent.setAttribute('data-rg-ifparent', '');
      }


      if (act === 'hide') {
        !!val ? elem.style.visibility = 'visible' : elem.style.visibility = 'hidden'; // elem exists but not visible
      } else if (act === 'remove') {
        !!val ? '' : this._commentElement(elem);
      }

      debug('rgIf', `${prop} = ${val} | act::"${act}"`, 'navy');
    }
  }



  /**
   * data-rg-switch="<controllerProperty> [@@ multiple]"
   * Parse the "data-rg-switch" attribute. Set element style attribute.
   * Examples:
   * data-rg-switch="ctrlprop" - ctrlprop is string, number or boolean
   * data-rg-switch="ctrlprop @@ multiple" - ctrlprop is array of string, number or boolean
   * Notice @@ multiple can select multiple switchcases.
   * @param {string} controllerProp - controller property name
   * @returns {void}
   */
  rgSwitch(controllerProp) {
    debug('rgSwitch', '--------- rgSwitch ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-switch';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!controllerProp) { elems = document.querySelectorAll(`[${attrName}="${controllerProp}"]`); }
    debug('rgSwitch', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'controllerProperty @@ multiple'
      const attrValSplited = attrVal.split(this.separator);

      const isMultiple = !!attrValSplited[1] ? attrValSplited[1].trim() === 'multiple' : false;

      const ctrlProp = attrValSplited[0].trim();
      const val = this[ctrlProp] || ''; // string, number, boolean

      // get data-rg-switchcase and data-rg-switchdefault attribute values
      let switchcaseElems = elem.querySelectorAll('[data-rg-switch] > [data-rg-switchcase]');
      let switchdefaultElem = elem.querySelector('[data-rg-switch] > [data-rg-switchdefault]');

      // temporary save
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = {switchcaseElems, switchdefaultElem};
      } else {
        switchcaseElems = this.temp[tempVarName].switchcaseElems;
        switchdefaultElem = this.temp[tempVarName].switchdefaultElem;
      }

      // empty the element with data-rg-switch attribute
      elem.innerHTML = '';

      // set or delete data-rg-switchcase element
      let isMatched = false; // is data-rg-switchcase value matched
      for (const switchcaseElem of switchcaseElems) {
        let switchcaseAttrVal = switchcaseElem.getAttribute('data-rg-switchcase');
        switchcaseAttrVal = switchcaseAttrVal.trim();
        if (!isMultiple && switchcaseAttrVal === val) { elem.innerHTML = switchcaseElem.outerHTML; isMatched = true; }
        else if (isMultiple && val.indexOf(switchcaseAttrVal) !== -1) { elem.append(switchcaseElem); isMatched = true; }
        else { switchcaseElem.remove(); }
        debug('rgSwitch', `data-rg-switch="${attrVal}" data-rg-switchcase="${switchcaseAttrVal}" --- val:: "${val}"`, 'navy');
      }

      if (!isMatched && !!switchdefaultElem) { elem.innerHTML = switchdefaultElem.outerHTML; }

    }

  }



  /**
   * data-rg-for="<propArr>[:limit:skip] [@@ outer|inner]"
   * Parse the "data-rg-for" attribute. Multiply element.
   * Examples:
   * data-rg-for="companies"
   * data-rg-for="company.employers"
   * @param {string} attrvalue - attribute value (limit parsing to only one HTML element)
   * @returns {void}
   */
  rgFor(attrvalue) {
    debug('rgFor', '--------- rgFor ------', 'navy', '#B6ECFF');

    // define attribute
    let attrDef;
    const attrName = 'data-rg-for';
    if (!attrvalue) {
      attrDef = attrName;
    } else {
      attrDef = `${attrName}^="${attrvalue}"`;
    }

    const elems = document.querySelectorAll(`[${attrDef}]`);
    debug('rgFor', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // company.employers
      const attrValSplited = attrVal.split(this.separator);

      const propLimSkp = attrValSplited[0].trim(); // company.employers:limit:skip
      const propLimSkpSplited = propLimSkp.split(':');

      let limitName = propLimSkpSplited[1]; // limit variable name
      limitName = !!limitName ? limitName.trim() : '';
      const limit = +this[limitName] || 1000;

      let skipName = propLimSkpSplited[2]; // skip variable name
      skipName = !!skipName ? skipName.trim() : '';
      const skip = +this[skipName] || 0;


      let prop = propLimSkpSplited[0];
      prop = prop.trim();
      const val = this._getControllerValue(prop);
      if(debug().rgFor) { console.log('val::', val, ' limit::', limit, ' skip::', skip); }
      if (!val) { return; }

      const max = skip + limit < val.length ? skip + limit : val.length;


      // save temporary initial innerHTML and outerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = elem.innerHTML;
      }


      let act = attrValSplited[1] || 'outer'; // outer|inner
      act = act.trim();

      if (act === 'outer') {
        // hide the original (reference) element
        elem.style.visibility = 'hidden';
        elem.innerHTML = '';

        // remove generated data-rg-for elements, i.e. elements with the data-rg-for-gen attribute
        const genElems = document.querySelectorAll(`[data-rg-for-gen="${attrVal}"]`);
        for (const genElem of genElems) { genElem.remove(); }

        // multiply element by cloning and adding sibling elements
        for (let i = skip; i < max; i++) {
          const j = max - 1 - i + skip;
          const innerHTML = this._parse$i(j, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...
          const newElem = elem.cloneNode();
          newElem.innerHTML = innerHTML;
          newElem.style.visibility = '';
          newElem.removeAttribute('data-rg-for');
          newElem.setAttribute('data-rg-for-gen', attrVal);
          elem.parentNode.insertBefore(newElem, elem.nextSibling);
        }

      } else if (act === 'inner') {

        // multiply the innerHTML in the data-rg-for-gen element
        elem.innerHTML = '';
        for (let i = skip; i < max; i++) {
          elem.innerHTML += this._parse$i(i, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...;
        }

      }

      debug('rgFor', `act:: ${act}`, 'navy');

    }

  }



  /**
   * data-rg-repeat="<number>"
   * Parse the "data-rg-repeat" attribute. Repeat the element n times.
   * Examples:
   * data-rg-repeat="10"
   * @param {number} num - number of iterations
   * @param {string} id - element's id, for example <p id="myID" data-rg-repeat="5">
   * @returns {void}
   */
  rgRepeat(num, id) {
    debug('rgRepeat', '--------- rgRepeat ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-repeat';
    let elems = document.querySelectorAll(`[${attrName}]`);
    if (!!id) { elems = document.querySelectorAll(`#${id}[${attrName}]`); }
    debug('rgRepeat', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName); // '10 @@ #comp'
      const max = +num || +attrVal.trim();

      // save temporary initial innerHTML and outerHTML
      const tempVarName = `${attrName} ${attrVal}`.replace(/\s/g, '_');
      if (!this.temp[tempVarName]) {
        this.temp[tempVarName] = elem.innerHTML;
      }

      // hide the original (reference) element
      elem.style.visibility = 'hidden';
      elem.innerHTML = '';

      // remove generated data-rg-for elements, i.e. elements with the data-rg-for-gen attribute
      const genElems = document.querySelectorAll(`[data-rg-repeat-gen="${attrVal}"]`);
      for (const genElem of genElems) { genElem.remove(); }

      // multiply element by cloning and adding sibling elements
      for (let i = 0; i < max; i++) {
        const j = max - 1 - i;
        const innerHTML = this._parse$i(j, this.temp[tempVarName]); // replace .$i or $i+1 , $i-1, $i^1, ...
        const newElem = elem.cloneNode();
        newElem.innerHTML = innerHTML;
        newElem.style.visibility = '';
        newElem.removeAttribute('id');
        newElem.removeAttribute('data-rg-repeat');
        newElem.setAttribute('data-rg-repeat-gen', attrVal);
        elem.parentNode.insertBefore(newElem, elem.nextSibling);
      }

      debug('rgRepeat', `max:: ${max}, id: ${id}`, 'navy');

    }
  }



  /**
   * data-rg-elem="<rgelemsProp>"
   * Parse the "data-rg-elem" attribute. Transfer the DOM element to the controller property "this.rgelems".
   * Examples:
   * data-rg-elem="paragraf" -> fetch it with this.rgelems['paragraf']
   * @returns {void}
   */
  rgElem() {
    debug('rgElem', '--------- rgElem ------', 'navy', '#B6ECFF');

    const attrName = 'data-rg-elem';
    const elems = document.querySelectorAll(`[${attrName}]`);
    debug('rgElem', `found elements:: ${elems.length}`, 'navy');
    if (!elems.length) { return; }

    // init the this.elems
    if (!this.rgelems) { this.rgelems = {}; }

    // associate values
    for (const elem of elems) {
      const attrVal = elem.getAttribute(attrName) || ''; // 'paragraf'
      this.rgelems[attrVal] = elem;
    }

  }







  /************ PRIVATES **********/
  /**
   * Get the controller property's value.
   * For example controller's property is this.company.name
   * @param {string} prop - controller property name, for example: company.name
   * @returns {any}
   */
  _getControllerValue(prop) {
    const propSplitted = prop.split('.'); // ['company', 'name']
    const prop1 = propSplitted[0]; // company
    let val = this[prop1]; // controller property value
    let i = 0;
    for (const prop of propSplitted) {
      if (i !== 0 && !!val) { val = val[prop]; }
      i++;
    }
    return val;
  }


  /**
   * Parse iteration variable $i in the text.
   * - replace .$i with the number i
   * - replace $i, $i+1 , $i-1, $i^1, ...
   * @param {number} i - number to replace $i with
   * @param {string} txt - text which needs to be replaced
   * @returns {string}
   */
  _parse$i(i, txt) {
    const txt2 = txt.replace(/\.\$i/g, `.${i}`)
      .replace(/\$i\s*(\+|\-|\*|\/|\%|\^)?\s*(\d+)?/g, (match, $1, $2) => {
        let result = i;
        const n = parseInt($2, 10);
        if ($1 === '+') { result = i + n; }
        else if ($1 === '-') { result = i - n; }
        else if ($1 === '*') { result = i * n; }
        else if ($1 === '/') { result = i / n; }
        else if ($1 === '%') { result = i % n; }
        else if ($1 === '^') { result = Math.pow(i, n); }
        return result;
      });
    return txt2;
  }


  /**
   * Create and clean function arguments
   * @param {string[]} args - array of function arguments: [x,y,...restArgs]
   * @param {HTMLElement} elem - HTML element on which is the event applied
   * @param {Event} event - applied event
   * @returns {string[]}
   */
  _getFuncArgs(args, elem, event) {
    const funcArgs = args
      .split(',')
      .map(arg => {
        arg = arg.trim().replace(/\'|\"/g, '');
        if (arg === '$element') { arg = elem; }
        if (arg === '$event') { arg = event; }
        return arg;
      });
    return funcArgs;
  }


  /**
   * Wrap element in the comment.
   * @param {Element} elem - HTML element DOM object
   * @returns {void}
   */
  _commentElement(elem) {
    const comment = document.createComment(elem.outerHTML); // define comment
    elem.parentNode.insertBefore(comment, elem); // insert comment above elem
    elem.remove();
  }


  /**
   * Remove the comment from the element.
   * @returns {void}
   */
  _uncommentAll() {
    const ifParentElems = document.querySelectorAll(`[data-rg-ifparent]`);
    const parser = new DOMParser();
    for (const ifParentElem of ifParentElems) {
      console.log('ifParentElem.childNodes::', ifParentElem.childNodes);
      for (const child of ifParentElem.childNodes) {
        const elemStr = child.nodeValue; // <p data-rg-if="ifX @@ remove">company name</p>
        if (child.nodeType === 8 && /data-rg-if/.test(elemStr)) { // 8 is comment https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
          const doc = parser.parseFromString(elemStr, 'text/html');
          const elem = doc.querySelector('[data-rg-if');
          console.log(ifParentElem, child, elem);
          if (!!elem) {
            ifParentElem.insertBefore(elem, child);
            child.remove();
          }
        }
      }
    }
  }


}


module.exports = Parse;

},{"./debug":20,"./eventEmitter":21}],20:[function(require,module,exports){
module.exports = (tip, text, color, background) => {
  const debugOpts = {
    // Parse.js
    rgKILL: false,
    rgHref: false,
    rgClick: false,
    rgChange: false,
    rgEvt: false,
    rgSet: false,

    rgPrint: false,
    rgClass: false,
    rgStyle: false,
    rgIf: true,
    rgSwitch: false,
    rgFor: false,
    rgRepeat: false,
    rgElem: false,

    // Load.js
    loadView: false,

    // Form.js
    setControl: false,
    getControl: false,
    delControl: false
  };

  if (debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }

  return debugOpts;
};

},{}],21:[function(require,module,exports){
class EventEmitter {

  /**
   * Create and emit the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {any} detail - event argument
   * @returns {void}
   */
  emit(eventName, detail) {
    const evt = new CustomEvent(eventName, {detail});
    window.dispatchEvent(evt);
  }


  /**
   * Listen for the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  on(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
    });
  }


  /**
   * Listen for the event only once
   * @param {string} eventName - event name, for example: 'pushstate'
   * @param {Function} listener - callback function with event parameter
   * @returns {void}
   */
  once(eventName, listener) {
    window.addEventListener(eventName, event => {
      listener(event);
      window.removeEventListener(eventName, () => {});
    }, {once: true});
  }


  /**
   * Stop listening the event
   * @param {string} eventName - event name, for example: 'pushstate'
   * @returns {void}
   */
  off(eventName) {
    window.removeEventListener(eventName, event => {});
  }



}


module.exports = new EventEmitter();

},{}],22:[function(require,module,exports){
const App = require('./App');
const Controller = require('./Controller');



module.exports = {
  App,
  Controller
};

},{"./App":13,"./Controller":14}],23:[function(require,module,exports){
const RegochRouter = require('regoch-router');
const eventEmitter = require('./eventEmitter');



class Router {

  constructor() {
    this.regochRouter = new RegochRouter({debug: false});
  }


  /**
   * Define route
   * @param {string} route - route, for example: '/page1.html'
   * @param {object} Ctrl - route controller instance
   * @returns {void}
   */
  when(route, ctrl) {
    if (!route) { throw new Error(`Route is not defined for ${ctrl.constructor.name} controller.`); }

    // controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.def(route, prerender, render, postrender, init);
  }


  /**
   * Define 404 not found route
   * @param {object} ctrl - route controller instance
   * @returns {void}
   */
  notFound(ctrl) {
    // controller methods
    const prerender = ctrl.prerender.bind(ctrl);
    const render = ctrl.render.bind(ctrl);
    const postrender = ctrl.postrender.bind(ctrl);
    const init = ctrl.init.bind(ctrl);

    this.regochRouter.notfound(prerender, render, postrender, init);
  }


  /**
   * Match routes against current browser URI.
   * @param {string} uri - browser's address bar URI
   * @returns {void}
   */
  testRoutes(uri) {
    this.regochRouter.trx = { uri };
    this.regochRouter.exe()
      // .then(trx => console.log('Route executed trx:: ', trx))
      .catch(err => console.error('ERRrouter:: ', err));
  }


  use() {
    // test URI against routes when browser's Reload button is clicked
    const uri = window.location.pathname + window.location.search; // /page1.html?q=12
    this.testRoutes(uri);

    // test URI against routes when element with data-rg-hrf attribute is clicked
    eventEmitter.on('pushstate', event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log(uri, event.detail.href);
      this.testRoutes(uri);
    });
  }



}





module.exports = new Router();

},{"./eventEmitter":21,"regoch-router":12}],24:[function(require,module,exports){
class Util {

  /**
   * Time delay
   * @param {number} ms - miliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}


module.exports = new Util();

},{}]},{},[2]);

//# sourceMappingURL=app.js.map
