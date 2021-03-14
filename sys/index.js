const Controller = require('./Controller');
const EventEmitter = require('./EventEmitter');
const Form = require('./Form');
const HTTPClient = require('./HTTPClient');
const Load = require('./Load');
const Parse = require('./Parse');
const Router = require('./Router');
const Util = require('./Util');


class App {

  constructor(appconf) {
    this.appconf = appconf;
    this.EventEmitter = EventEmitter;
    this.Form = Form;
    this.HTTPClient = HTTPClient;
    this.Load = Load;
    this.Parse = Parse;
  }


  use(router) {
    // test URI against routes when browser's Reload button is clicked
    const uri = window.location.pathname + window.location.search; // /page1.html?q=12
    router.testRoutes(uri);

    // test URI against routes when element with data-rg-hrf attribute is clicked
    const eventEmitter = new EventEmitter();
    eventEmitter.on('pushstate', event => {
      const uri = window.location.pathname + window.location.search; // browser address bar URL
      // console.log(uri, event.detail.href);
      router.testRoutes(uri);
    });
  }



}


const router = new Router();



module.exports = {
  App,
  Controller,
  Load,
  HTTPClient,
  Form,
  router,
  Util
};
