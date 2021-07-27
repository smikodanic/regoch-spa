const { Controller } = require('../../../sys');


class WebsocketClientsCtrl extends Controller {

  constructor(app) {
    super();
  }


  async loader() {
    this.setTitle('Regoch Websocket Clients');
    this.setLang('en');
    await this.loadView('#primary', 'pages/websocket/clients/primary.html', 'sibling');
    await this.loadInc();
    await this.loadView('#main', 'pages/websocket/clients/main.html');
    await this.rgLazyjs();
  }

  async rend() {
    this.showButtonBars = false;
    await this.rgIf('showButtonBars');
  }


  destroy(elem, event) {
    this.unlazyJS();
  }


}


module.exports =  WebsocketClientsCtrl;
