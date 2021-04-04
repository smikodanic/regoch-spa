const { Controller } = require('regoch-spa');


class NotfoundCtrl extends Controller {

  async prerender(trx) {
    console.error(`404 not found: ${trx.uri}`);
    await this.loadView('#primary', 'pages/notfound/primary.html', 'sibling');
  }

}


module.exports = NotfoundCtrl;
