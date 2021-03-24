const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    await this.loadView('#primary', 'pages/home/primary.html', 'sibling');
    this.loadViews([
      ['#top', 'pages/shared/top.html'],
      ['#main', 'pages/home/main.html'],
      ['#bottom', 'pages/home/bottom.html']
    ]);
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


};
