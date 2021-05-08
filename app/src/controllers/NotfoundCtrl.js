const { Controller } = require('../../../sys');


class NotfoundCtrl extends Controller {

  async init(trx) {
    console.error(`404 not found: ${trx.uri}`);
    await this.loadView('#primary', 'pages/notfound/primary.html', 'sibling');
  }

}


module.exports = NotfoundCtrl;
