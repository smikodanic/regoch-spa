const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    console.log('app:', app);
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);
    await this.loadView('#sibling', 'pages/home/sibling.html', 'sibling');
    await this.loadViews([
      ['#top', 'pages/shared/top.html'],
      ['#bottom', 'pages/home/bottom.html'],
      ['#main', 'pages/home/main.html'],
      ['#footer', 'pages/home/footer.html']
    ]);
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.dataRgs);
  }


};
