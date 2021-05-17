const { Controller, syslib } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();

    this.model = new syslib.Model([
      'company.name',
      'company.year',
      'company.isActive',
      'company.cities',
      // 'company', // will always render
      // 'company.employees' // will always render
    ], this);

    this.model.debugOpts = {
      fill: true,
      watch: true,
      watchStart: true,
      watchStop: true,
      set: false,
      reset: false
    };
    this.debugOpts = {render: true};
  }


  async loader(trx) {
    this.setTitle('Model Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/model/primary.html');
  }


  async init(trx) {
    this.company = {
      name: 'Cloud Ltd',
      year: 1987,
      isActive: false,
      cities: ['London', 'Tokyo', 'Paris'],
      employees: [
        {name: 'John Doe', age: 22},
        {name: 'Melinda Doe', age: 21}
      ]
    };

    this.i = 0;
  }


  destroy() {
    this.model.watchStop();
  }


  runWatch(action) {
    action == 'start' ? this.model.watchStart(4000) : this.model.watchStop();
  }


  testArray() {
    console.log('testArray - start');
    this.company.cities = ['London', 'Tokyo']; // array-length
    // this.company.cities = ['London', 'Tokyo', 'Zagreb']; // array-element
    console.log('testArray - end, company:', this.company);
  }

  testPrimitives() {
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
    this.model.set('company.year', rnd);
    await syslib.util.sleep(1000);
    if (this.i < 5) { this.test_modelSet(); }
    this.i++;
  }


  // reset company.name and re-render the view
  test_modelReset() {
    this.model.reset('company.name');
  }

  // reset the whole $model and re-render
  test_modelReset_all() {
    this.model.reset();
  }






}


module.exports =  ModelCtrl;
