const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    // console.log(app.CONST);
  }

  async prerender(trx) {
    this.setTitle('The Regoch Project');
    this.setDescription('The Regoch Project is bundle of developer tools and frameworks for realtime, web and mobile applications: regoch websocket server and client, single page app, database.');
    this.setKeywords('regoch, websocket, realtime, mobile applications, single page app, database');
    this.setLang('en');

    await this.loadView('#primary', 'pages/home/primary.html', 'sibling');
    this.loadViews([
      ['#top', 'pages/home/top.html'],
      ['#main', 'pages/home/main.html'],
      ['#bottom', 'pages/home/bottom.html']
    ], true);
  }


};
