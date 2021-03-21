const { Controller } = require('../../../sys');


class NotfoundCtrl extends Controller {

  async prerender(trx) {
    console.error(`404 not found: ${trx.uri}`);
    await this.loadView('#top', 'pages/shared/top.html');
    await this.loadView('#main', 'pages/notfound/main.html');
    await this.emptyView('#bottom');
  }

}


module.exports = NotfoundCtrl;
