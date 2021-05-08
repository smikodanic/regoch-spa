const { Controller, syslib } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = {
      modelFill: false,
      modelWatch: true,
      modelSet: false,
      modelReset: true
    };
    this.modelSchema({
      'company': 'object',
      'company.name': 'string',
      'company.year': 'number',
      'company.isActive': 'boolean',
      'company.cities': 'array',
      'company.employees': 'array'
    });
    this.i = 0;
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
      cities: ['London', 'Tokyo', 'Paris'],
      employees: [
        {name: 'John Doe', age: 22},
        {name: 'Melinda Doe', age: 21},
      ]
    };
  }


  async testDataType() {
    console.log('testDataType - start');
    await syslib.util.sleep(1300);
    this.company.name = 555; // dataType-number
    this.company.year = '1988 year'; // dataType-number
    this.company.isActive = 'yes'; // dataType-boolean
    console.log('testDataType - end, company:', this.company);
  }

  async testArray() {
    console.log('testArray - start');
    // this.company.cities = ['London', 'Tokyo']; // array-length
    this.company.cities = ['London', 'Tokyo', 'Zagreb']; // array-element
    console.log('testArray - end, company:', this.company);
  }

  async testPrimitives() {
    console.log('testPrimitives - start');
    this.company = {
      name: 'ABC Ltd',
      year: 2001
    };
    console.log('testPrimitives - end, company:', this.company);
  }


  // emulate the stream of data by calling the mthod recursively
  async test_modelSet() {
    const rnd = Math.floor(Math.random() * 1000);
    // this.company.year = rnd; // will update the model value only first time
    this.modelSet('company.year', rnd);
    await syslib.util.sleep(1000);
    if (this.i < 5) { this.test_modelSet(); }
    this.i++;
  }


  // reset company.name and re-render the view
  async test_modelReset() {
    await syslib.util.sleep(1000);
    this.modelReset('company.name');
  }

  // reset the whole $model and re-render
  async test_modelReset_all() {
    await syslib.util.sleep(1000);
    this.modelReset();
  }






}


module.exports =  ModelCtrl;
