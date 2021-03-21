const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    console.log('app:', app);
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    await this.loadView('#home', 'pages/home/home.html');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


};
