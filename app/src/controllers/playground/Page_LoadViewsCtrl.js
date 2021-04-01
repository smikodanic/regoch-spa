const { Controller } = require('../../../../sys');


class Page_LoadViewsCtrl extends Controller {

  constructor(app) {
    super();
  }


  async prerender(trx) {
    this.setTitle('loadViews() Test');
    this.unloadCSS(['/assets/css/theme.css']);

    await this.loadViews([
      ['#primary', 'playground/page-loadviews/primary.html', 'sibling'],
      ['#primary.html#part1', 'playground/page-loadviews/part1.html'],
      ['#primary.html#part2', 'playground/page-loadviews/part2.html', 'append'],
      ['#primary.html#part3', 'playground/page-loadviews/part3.html', 'prepend']
    ], true);
  }

}


module.exports =  Page_LoadViewsCtrl;
