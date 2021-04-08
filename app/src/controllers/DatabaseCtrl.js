const { Controller } = require('../../../sys');


class DatabaseCtrl extends Controller {

  constructor(app) {
    super();
    this.syslib = app.syslib;
    this.util = app.syslib.util;
  }


  async prerender(trx) {
    this.setTitle('Regoch Database');
    this.setDescription('Regoch database based on the linux file system and grep command. Big scalability.');
    this.setKeywords('regoch, database, linux, filesystem, grep');
    this.setLang('en');

    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);

    await this.loadView('#primary', 'pages/database/primary.html', 'sibling');
    this.loadViews([
      ['#sidebar', 'pages/database/sidebar.html'],
      ['#article-introduction', 'pages/database/article-introduction.html']
    ], true);

  }


  async postrender(trx) {

    await this.util.sleep(1300);
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


module.exports =  DatabaseCtrl;
