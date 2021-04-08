const { Controller } = require('../../../sys');


class ContactCtrl extends Controller {

  constructor(app) {
    super();
    this.syslib = app.syslib;
    this.util = app.syslib.util;
  }


  async prerender(trx) {
    this.setTitle('Regoch Contact');
    this.setDescription('Regoch contact.');
    this.setKeywords('regoch, contact');
    this.setLang('en');

    await this.loadView('#primary', 'pages/contact/primary.html', 'sibling');
    this.loadViews([
      ['#top', 'pages/home/top.html'],
      ['#main', 'pages/contact/main.html']
    ]);
  }


}


module.exports =  ContactCtrl;
