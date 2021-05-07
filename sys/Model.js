const Page = require('./Page');

class Model extends Page {

  constructor() {
    super();
    this.$schema = {};
    this.$model = {};
    this.stopModelWatch = false;
  }


  /**
   * Set the model schema.
   * @param {object} sch - model schema object: {'companies': 'array', 'user.name': string}
   */
  modelSchema(sch) {
    this.$schema = sch;
  }


  /**
   * Get the controller value ('this.company.name') and set the $model value ('this.$model.company.name).
   * The this.$model is the previous model value and it's comared with the current controller value. For example: this.company.name vs. this.$model.company.name .
   */
  modelSave() {
    this._debug('modelSave', '--------- modelSave ------', '#760D94', '#EAC4F5');
    const props = Object.keys(this.$schema); // ['companies', 'user.name']
    for (const prop of props) {
      const val = this._getControllerValue(prop);
      this._setModelValue(prop, val);
      this._debug('modelWatch', `saved:: ${prop}=${val}`, '#760D94');
    }
  }


  /**
   * Compare current controller value and stored $model values. If they are different then render the controller property.
   */
  modelWatch() {
    this._debug('modelWatch', '--------- modelWatch ------', '#760D94', '#EAC4F5');
    const props = Object.keys(this.$schema); // ['companies', 'user.name']

    label1: for (const prop of props) {
      const dataType = this.$schema[prop]; // 'array', 'string', 'number', 'boolean'
      const valCtrl = this._getControllerValue(prop);
      const valMdl = this._getModelValue(prop);


      let toRender = false;
      /* A) check the controller property type (if the controller property data type is modified then render that property) */
      if (/array/i.test(dataType) && !Array.isArray(valCtrl)) {  }
      else if (/string/i.test(dataType) && typeof valCtrl !== 'string') { toRender = true; }
      else if (/number/i.test(dataType) && typeof valCtrl !== 'number') { toRender = true; }
      else if (/boolean/i.test(dataType) && typeof valCtrl !== 'boolean') { toRender = true; }
      else if (/bigint/i.test(dataType) && typeof valCtrl !== 'bigint') { toRender = true; }
      else if (/symbol/i.test(dataType) && typeof valCtrl !== 'symbol') { toRender = true; }

      /* B) check the controller property value (if the controller property value is modified then render that property) */
      if (Array.isArray(valCtrl)) { // ARRAY

        if (valCtrl && valMdl && valCtrl.length !== valMdl.length) { // first check the length
          toRender = true;
        } else { // if the array lengths are same then compare array elements
          let key = 0;
          label2: for (const elem of valCtrl) {
            if (elem !== valMdl[key]) { this.render(prop); break label2; }
            key++;
          }
        }

      } else { // PRIMITIVE DATA TYPES
        if (valCtrl !== valMdl) {
          toRender = true;
        }
      }


      this._debug('modelWatch', `prop: ${prop} -- dataType: ${dataType} --  valCtrl: ${valCtrl} vs. valMdl: ${valMdl} => toRender: ${toRender}`, '#760D94');
      if (toRender) { this.render(prop); continue label1; }

    }
  }







  /*** PRIVATES ***/
  /**
   * Get the model property's value. For example model's property is this.$model.company.name
   * @param {string} prop - model property name, for example: 'company.name'
   * @returns {any}
   */
  _getModelValue(prop) {
    const propSplitted = prop.split('.'); // ['company', 'name']
    const prop1 = propSplitted[0]; // company
    let val = this.$model[prop1]; // model property value
    propSplitted.forEach((prop, key) => {
      if (key !== 0 && !!val) { val = val[prop]; }
      console.log(prop, '--', val);
    });
    return val;
  }

  /**
   * Set the $model value. For example: prop='company.name' & val='Cloud Ltd' => this.$model.company.name = 'Cloud Ltd'
   * @param {string} prop - model property name, for example: 'company.name'
   * @param {any} val - model value
   */
  _setModelValue(prop, val) {
    const propSplitted = prop.split('.'); // ['company', 'name']
    let i = 1;
    let obj = this.$model;
    for (const prop of propSplitted) {
      if (i !== propSplitted.length) { // not last property
        if (obj[prop] === undefined) { obj[prop] = {}; }
        obj = obj[prop];
      }
      else { // on last property associate the value
        obj[prop] = val;
      }
      i++;
    }
  }


}

module.exports = Model;
