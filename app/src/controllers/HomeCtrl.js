const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    console.log('app:', app);
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    await this.loadView('#top', 'pages/shared/top.html');
    await this.loadView('#main', 'pages/home/main.html');
    await this.loadView('#bottom', 'pages/home/bottom.html');
    await this.loadView('#footer', 'pages/home/footer.html');
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


};
