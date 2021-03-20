const { Controller, Load } = require('../../../sys');

class Page1Ctrl extends Controller {
  constructor(app) {
    super();
    console.log('PAGE1 constructor');
    this.load = app.sys.load;
  }

  async prerender(trx) {
    console.log('PAGE1 prerender', trx);
    $('title').text('PAGE 1');

    // views
    await this.load.view('header', 'inc/header.html', 'h2 > small', 'append');
    await this.load.view('footer', 'inc/footer3.html');
    await this.load.view('home1', 'page1.html', 'h1');
    await this.load.view('home2', '');
  }

  init(trx, dataRgs) {
    console.log('PAGE1 init', trx, dataRgs);
  }

  destroy(elem, event, dataRgs) {
    console.log('PAGE1 destroy', elem, event, dataRgs);
  }




}


module.exports = Page1Ctrl;
