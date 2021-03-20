const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    this.view = app.sys.view;
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
    await this.loadView('#home', 'pages/home/home.html');
    // await this.view.load('#home', 'home.html', 'img', 'sibling');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


};
