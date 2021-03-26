const { Controller } = require('../../../sys');


module.exports = class HomeCtrl extends Controller {

  constructor(app) {
    super();
    console.log('HOME constructor');
    // console.log(app.lib);
  }


  async prerender(trx) {
    console.log('HOME prerender', trx);

    this.setTitle('The Regoch Project');
    this.setDescription('The Regoch Project is bundle of developer tools and frameworks for realtime, web and mobile applications: regoch websocket server and client, single page app, database.');
    this.setKeywords('regoch, websocket, realtime, mobile applications, single page app, database');
    this.setLang('en');


    // this.loadCSS([
    //   'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
    // ]);

    await this.loadView('#primary', 'pages/home/primary.html', 'sibling');
    this.loadViews([
      ['#top', 'pages/shared/top.html'],
      ['#main', 'pages/home/main.html'],
      ['#bottom', 'pages/home/bottom.html']
    ]);
  }


  async postrender(trx) {
    console.log('HOME postrender', trx, this.rgListeners);
    // this.unloadCSS([
    //   'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
    // ]);
  }


};
