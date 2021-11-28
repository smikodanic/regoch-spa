const { Controller } = require('../../../../sys');


class ModelCtrl extends Controller {

  constructor(app) {
    super();
    this.debugOpts = { render: true };
  }


  async loader(trx) {
    this.setTitle('Model Test');
    this.loadCSS(['https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-coy.min.css']);
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/model/primary.html');
  }


  async init(trx) {
    this.$model.user = { name: 'John Doe', age: 11 };
  }




  async str() {
    this.$model.first_name = 'Saša';
    await new Promise(r => setTimeout(r, 1300));
    this.model('first_name').setValue('Saša');
    await new Promise(r => setTimeout(r, 1300));
    this.$model.first_name = 'Petar'; // shortcut for  this.model('first_name').setValue('Petar');
  }

  async obj() {
    this.$model.user = { name: 'John', age: 23, isActive: false };
    await new Promise(r => setTimeout(r, 1300));
    this.$model.user = { name: 'Peter', age: 28, isActive: true };
  }

  async arr() {
    this.$model.pets = ['dog', 'cat'];
    await new Promise(r => setTimeout(r, 1300));
    this.model('pets').mpush('rabbit');
    await new Promise(r => setTimeout(r, 1300));
    this.model('pets').mpop();
    await new Promise(r => setTimeout(r, 1300));
    this.model('pets').munshift('anaconda');
    await new Promise(r => setTimeout(r, 1300));
    this.model('pets').mshift();
  }


  async level5() {
    this.$model.car = { x: { y: { z: { w: { year: 2011 } } } } };
    await new Promise(r => setTimeout(r, 1300));
    this.model('car').setValue(2015, 'x.y.z.w.year');
  }




}


module.exports = ModelCtrl;
