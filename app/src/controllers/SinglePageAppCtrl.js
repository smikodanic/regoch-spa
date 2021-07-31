const { Controller, syslib } = require('../../../sys');


class SinglePageAppCtrl extends Controller {

  constructor(app) {
    super();
  }

  async loader(trx) {
    // await this.loadHead('pages/single-page-app/head.html', 'inner'); // will cause flicker

    this.setTitle('Regoch Single Page Application Framework');
    this.setDescription('The Regoch SPA is framework for developing single page, web applications. Very simple for use and extremly fast.');
    this.setKeywords('regoch, spa, single page app, web applications');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/single-page-app/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/single-page-app/sidebar.html'],
      ['#article-introduction', 'pages/single-page-app/article-introduction.html'],
      ['#article-app', 'pages/single-page-app/article-app.html'],
      ['#article-controller', 'pages/single-page-app/article-controller.html'],
      ['#article-model', 'pages/single-page-app/article-model.html'],
      ['#article-page', 'pages/single-page-app/article-page.html'],
      ['#article-datarg', 'pages/single-page-app/article-datarg.html'],
      ['#article-datarglisteners', 'pages/single-page-app/article-datarglisteners.html'],
      ['#article-router', 'pages/single-page-app/article-router.html'],

      ['#article-auth', 'pages/single-page-app/article-auth.html'],
      ['#article-cookie', 'pages/single-page-app/article-cookie.html'],
      ['#article-eventemitter', 'pages/single-page-app/article-eventemitter.html'],
      ['#article-form', 'pages/single-page-app/article-form.html'],
      ['#article-httpclient', 'pages/single-page-app/article-httpclient.html'],
      ['#article-navig', 'pages/single-page-app/article-navig.html'],
      ['#article-util', 'pages/single-page-app/article-util.html'],
      // ['#footer', 'pages/single-page-app/footer.html']
    ], true);
    this.loadInc();
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

  async destroy(elem, event) {
    this.unlazyJS();
  }


}


module.exports =  SinglePageAppCtrl;
