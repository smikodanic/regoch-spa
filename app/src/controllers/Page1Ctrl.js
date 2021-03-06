const Controller = require('../../../sys/Controller');

class Page1Ctrl extends Controller {

  async init(trx) {
    console.log('\n+++ Page1Ctrl initialised');
    $('title').text('PAGE 1');

    // include views
    await this.loadIncView('header', 'inc/header.html', 'h2 > small', 'append');
    await this.loadIncView('footer', 'inc/footer3.html');

    // route views
    await this.loadRouteView('home1', 'page1.html', 'h1');
  }

}


module.exports = Page1Ctrl;
