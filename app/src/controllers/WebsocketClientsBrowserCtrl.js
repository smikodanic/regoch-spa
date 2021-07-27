const { Controller, syslib } = require('../../../sys');


class WebsocketClientsBrowserCtrl extends Controller {

  constructor(app) {
    super();
  }


  async loader(trx) {
    this.setTitle('Regoch Websocket Client for Browser');
    this.setDescription('Websocket client for Browser platform or browserify. The client works best in conjuction with the Regoch Websocket Server.');
    this.setKeywords('websocket, client, browser, regoch');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/websocket/clients/browser/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/websocket/clients/browser/sidebar.html'],
      ['#article-introduction', 'pages/websocket/clients/browser/article-introduction.html'],
      ['#article-client13jsonrws', 'pages/websocket/clients/browser/article-client13jsonrws.html'],
      ['#article-router', 'pages/websocket/clients/browser/article-router.html'],
      ['#article-helper', 'pages/websocket/clients/browser/article-helper.html'],
      ['#article-stringext', 'pages/websocket/clients/browser/article-stringext.html'],
    ], true);
    this.loadInc();

  }

  async rend() {
    this.showButtonBars = true;
    await this.rgIf('showButtonBars');
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


module.exports =  WebsocketClientsBrowserCtrl;
