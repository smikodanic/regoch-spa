const { Controller, syslib } = require('../../../sys');


class RouterCtrl extends Controller {

  constructor(app) {
    super();
  }


  async loader(trx) {
    this.setTitle('Regoch Router');
    this.setDescription('Regoch Router is fast router with no dependencies for NodeJS and browser environment. Minimalistic but very powerful library.');
    this.setKeywords('router, server side, client side, nodejs, browser, regoch');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/router/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/router/sidebar.html'],
      ['#article-introduction', 'pages/router/article-introduction.html'],
      ['#article-router', 'pages/router/article-router.html'],
    ], true);
  }


  async postrend(trx) {
    this.showButtonBars = true;
    await this.rgIf('showButtonBars');

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


module.exports = RouterCtrl;
