const { Controller, syslib } = require('../../../sys');


class WebsocketClientsCtrl extends Controller {

  constructor(app) {
    super();
  }


  async loader(trx) {
    this.setTitle('Regoch Websocket Clients');
    this.setDescription('Websocket clients for different environments: browser, nodejs, angular etc. The clients works best with the Regoch Websocket Server.');
    this.setKeywords('websocket, client, browser, nodejs, angular, regoch');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/websocket-clients/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/websocket-clients/sidebar.html'],
      ['#article-introduction', 'pages/websocket-clients/article-introduction.html'],
      ['#article-client13jsonrws', 'pages/websocket-clients/article-client13jsonrws.html'],
      ['#article-router', 'pages/websocket-clients/article-router.html'],
      ['#article-helper', 'pages/websocket-clients/article-helper.html'],
      ['#article-stringext', 'pages/websocket-clients/article-stringext.html'],
    ], true);
    this.loadInc();

  }

  async postrend(trx) {
    await syslib.util.sleep(1300);
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.8/highlight.min.js',
      '/assets/js/highlight-custom.js',
      '/assets/plugins/jquery.scrollTo.min.js',
      '/assets/plugins/lightbox/dist/ekko-lightbox.min.js',
      '/assets/js/docs.js',
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);
  }

  destroy(elem, event) {
    this.unlazyJS();
  }


}


module.exports =  WebsocketClientsCtrl;
