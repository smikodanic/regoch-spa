const { Controller } = require('../../../../sys');


class Page_LoadViewsCtrl extends Controller {

  constructor(app) {
    super();
  }


  async prerender(trx) {
    this.setTitle('loadViews() Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);

    await this.loadViews([
      ['#primary', 'playground/page-loadviews/primary.html', 'sibling'],
      ['#primary.html#part1', 'playground/page-loadviews/part1.html'],
      ['#primary.html#part2', 'playground/page-loadviews/part2.html', 'append'],
      ['#primary.html#part3', 'playground/page-loadviews/part3.html', 'prepend']
    ], true);
  }


  async postrender(trx) {
    this.lazyJS([
      'https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js'
    ]);

  }


  destroy(elem, event) {
    this.unloadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unlazyJS();
  }


}


module.exports =  Page_LoadViewsCtrl;
