const { Controller, syslib } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      modelSave: true,
      modelWatch: true,
    };
    this.modelSchema({
      'company.name': 'string',
      'company.year': 'number',
      // 'company.isActive': 'boolean',
      // 'company.cities': 'array'
    });
  }

  async init(trx) {
    this.setTitle('Model Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/model/primary.html');
  }

  async prerender() {
    this.company = {
      name: 'Cloud Ltd',
      year: 1987,
      isActive: false,
      cities: ['London', 'Tokyo', 'Paris']
    };
  }


  async testDataType() {
    console.log('testDataType - start');
    await syslib.util.sleep(1300);
    // this.company.name = 2022; // string to number
    this.company.year = '1988 year'; // string to number
    console.log(this.company);
  }






}


module.exports =  ModelCtrl;
