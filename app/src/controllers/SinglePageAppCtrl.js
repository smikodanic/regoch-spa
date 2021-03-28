const { Controller } = require('../../../sys');
const HTTPclient = require('../../../sys/HTTPClient');


class SinglePageAppCtrl extends Controller {

  constructor(app) {
    super();
    console.log('SinglePageApp constructor');
    this.sys = app.sys;
    this.hc = new HTTPclient();
  }


  async prerender(trx) {
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
      ['#article-page', 'pages/single-page-app/article-page.html'],
      // ['#footer', 'pages/single-page-app/footer.html']
    ], true);

  }


  async postrender(trx) {
    console.log('SinglePageApp postrender', trx, this.rgListeners);

    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.8/highlight.min.js',
      '/assets/js/highlight-custom.js',
      '/assets/plugins/jquery.scrollTo.min.js',
      '/assets/plugins/lightbox/dist/ekko-lightbox.min.js',
      '/assets/js/docs.js',
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);

    // this.loadJS([
    //   '/assets/plugins/jquery-3.4.1.min.js',
    //   '/assets/plugins/popper.min.js',
    //   '/assets/plugins/bootstrap/js/bootstrap.min.js',

    //   '/assets/js/highlight-custom.js',
    //   '/assets/plugins/jquery.scrollTo.min.js',
    //   '/assets/plugins/lightbox/dist/ekko-lightbox.min.js',
    //   '/assets/js/docs.js'
    // ]);

  }


  destroy(elem, event) {
    console.log('SinglePageApp destroy', elem, event);
    this.unlazyJS();
  }


}


module.exports =  SinglePageAppCtrl;
