const { Controller } = require('../../../../sys');


class View_loadViewsCtrl extends Controller {

  constructor(app) {
    super();
  }


  async loader(trx) {
    this.setTitle('loadViews() Test');
    this.unloadCSS(['/assets/css/theme.css']);

    await this.loadViews([
      ['#primary', 'playground/view-loadviews/primary.html', 'sibling'],
      ['#primary.html#part1', 'playground/view-loadviews/part1.html'],
      ['#primary.html#part2', 'playground/view-loadviews/part2.html', 'append'],
      ['#primary.html#part3', 'playground/view-loadviews/part3.html', 'prepend']
    ], true); // isAsync is true
  }

}


module.exports = View_loadViewsCtrl;
