const { Controller } = require('../../../sys');


class HomeCtrl extends Controller {

  constructor(app) {
    super();
  }

  async prerender(trx) {
    this.setTitle('The Regoch App');
    this.setDescription('The Regoch app description.');
    this.setKeywords('regoch, app');
    this.setLang('en');

    await this.loadView('#primary', 'pages/home/primary.html', 'sibling');
    this.loadViews([
      ['#main', 'pages/home/main.html'],
      ['#img', 'pages/home/img.html'],
    ], true);
  }

}


module.exports = HomeCtrl;
