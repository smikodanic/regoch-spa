const { Controller, syslib } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = { render: false };
  }


  async loader(trx) {
    this.setTitle('Model Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/model/primary.html');
  }


  async init(trx) {
    const userModel = {
      name: 'string',
      age: 'number',
      isActive: 'boolean',
      company: {
        name: 'string',
        employers: 'string[]',
        years: 'number[]'
      }
    };
    this.model('user', userModel);

  }









}


module.exports = ModelCtrl;
