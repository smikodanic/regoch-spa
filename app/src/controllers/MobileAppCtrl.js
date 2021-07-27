const { Controller, syslib } = require('../../../sys');


class MobileAppCtrl extends Controller {

  constructor(app) {
    super();
  }

  async loader(trx) {
    this.setTitle('Regoch Mobile App');
    this.setDescription('Regoch Mobile App is the framework for building complex but extremly fast mobile applications. It is based on regoch SPA and Cordova.');
    this.setKeywords('regoch, mobile, application, app, android, iOS');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/mobile-app/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/mobile-app/sidebar.html'],
      ['#article-introduction', 'pages/mobile-app/article-introduction.html']
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


module.exports =  MobileAppCtrl;
