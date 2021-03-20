const { Controller } = require('../../../.sys');


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
    // await this.load.view('header', 'inc/header.html', 'h2 > small', 'sibling');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


}


module.exports = IndexCtrl;
