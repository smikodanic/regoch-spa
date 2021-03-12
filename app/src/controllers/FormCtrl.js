const Controller = require('../../../sys/Controller');
const Form = require('../../../sys/Form');
const Util = require('../../../sys/Util');



class FormCtrl extends Controller {

  constructor() {
    super();
    this.userForm = new Form('userF');
    this.util = new Util();
  }

  async onRender(trx) {
    await this.loadView('home1', 'form.html');
  }


  async onInit(trx, dataRgs) {
    console.log('FORM init', trx, dataRgs);
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


  async setCountry() {
    this.userForm.setControl('country', 'Croatia');
    await this.util.sleep(1300);
    this.userForm.setControl('country', 'UK');
    await this.util.sleep(1300);
    this.userForm.delControl('country');
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


module.exports = FormCtrl;
