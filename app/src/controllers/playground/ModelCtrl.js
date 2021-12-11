const { Controller } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = { render: true };
    // this.$model.user = { name: 'John Doe2', age: 12 }; // this will cause the error. Don't use $model in the constructor
  }


  async loader(trx) {
    this.setTitle('Model Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/model/primary.html');
  }


  async init(trx) {
    this.$model.user = { name: 'John Doe', age: 11 }; // this is ok because $model is used after loader()
    console.log('$model::', this.$model);
  }




  async str() {
    this.$model.first_name = 'Saša';
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('first_name').setValue('Marko');
    await new Promise(r => setTimeout(r, 1300));
    this.$model.first_name = 'Petar'; // shortcut for  this.$model.use('first_name').setValue('Petar');
  }

  async obj() {
    this.$model.user = { name: 'John', age: 23, isActive: false };
    await new Promise(r => setTimeout(r, 1300));
    this.$model.user = { name: 'Peter', age: 28, isActive: true };
  }

  async arr() {
    this.$model.pets = ['dog', 'cat'];
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('pets').mpush('rabbit');
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('pets').mpop();
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('pets').munshift('anaconda');
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('pets').mshift();
  }


  async level5() {
    this.$model.car = { x: { y: { z: { w: { year: 2011 } } } } };
    await new Promise(r => setTimeout(r, 1300));
    this.$modeler.use('car').setValue(2015, 'x.y.z.w.year');
    await new Promise(r => setTimeout(r, 1300));
    const car = this.$modeler.use('car').getValue();
    console.log('car::', car);
    const year = this.$modeler.use('car').getValue('x.y.z.w.year');
    console.log('year::', year);

    this.$model.yearOfCar = year;
    await new Promise(r => setTimeout(r, 1300));
    delete this.$model.yearOfCar; // delete will not render the $model
  }




}


module.exports = ModelCtrl;
