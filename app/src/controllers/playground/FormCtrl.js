const { Controller } = require('../../../../sys');


class FormCtrl extends Controller {

  constructor(app) {
    super();
    this.util = app.syslib.util;
    this.userForm = new app.syslib.Form('userF');
  }

  async prerender(trx) {
    this.setTitle('DataRg Test');
    this.unloadCSS(['/assets/css/theme.css']);
    await this.loadView('#primary', 'playground/form/primary.html', 'inner');
  }



  async setFullName() {
    this.userForm.setControl('fullName', 'John');

    await this.util.sleep(1300);
    this.userForm.setControl('fullName', 'Johnny');

    await this.util.sleep(800);
    const fullName = this.userForm.getControl('fullName');
    console.log('fullName::', fullName);

    await this.util.sleep(800);
    this.userForm.delControl('fullName');
  }
  async getFullName() {
    const fullName = this.userForm.getControl('fullName');
    console.log('fullName::', fullName);
  }


  async setAge() {
    this.userForm.setControl('age', 23);
  }
  async getAge() {
    const age = this.userForm.getControl('age');
    console.log('age::', typeof age, age);
  }


  async setCountry() {
    this.userForm.setControl('country', 'Croatia');
    await this.util.sleep(1300);
    this.userForm.setControl('country', 'UK');
    await this.util.sleep(1300);
    this.userForm.delControl('country');
  }
  async getCountry() {
    const country = this.userForm.getControl('country');
    console.log('country::', country);
  }


  async setFamily() {
    this.userForm.setControl('family', ['Betty', 'Lara']);
  }
  async getFamily() {
    const family = this.userForm.getControl('family');
    console.log('family::', family);
  }
  async emptyFamily() {
    this.userForm.delControl('family');
  }


  async setJobs() {
    this.userForm.setControl('jobs', ['IT', 'Marketing']);
  }
  async getJobs() {
    const jobs = this.userForm.getControl('jobs');
    console.log('selected jobs::', jobs);
  }
  async emptyJobs() {
    this.userForm.delControl('jobs');
  }


  async setPet() {
    this.userForm.setControl('pet', 'cat');
  }
  async getPet() {
    const pet = this.userForm.getControl('pet');
    console.log('selected pet::', pet);
  }
  async emptyPet() {
    this.userForm.delControl('pet');
  }



  async setAll() {
    this.userForm.setControls({
      fullName: 'John Doe',
      age: 48,
      country: 'Kenya'
    });
  }



}


module.exports =  FormCtrl;
