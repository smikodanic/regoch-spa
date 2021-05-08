const Page = require('./Page');

class Model extends Page {

  constructor() {
    super();
    this.$schema = {}; // this.$schema = {'companies': 'array', 'user.name': 'string'}
    this.$model = {}; // this.$model = {companies: ['Cloud Ltd', 'ABC Ltd], user: {name: 'John Doe'}}
  }


  /****** INTERNAL METHODS *******/
  /**
   * Get the controller values ('this.company.name') and set the $model values ('this.$model.company.name).
   * The this.$model is the previous model value and it's compared with the current controller value. For example: this.company.name vs. this.$model.company.name .
   */
  modelFill() {
    this._debug('modeFill', '--------- modeFill ------', '#760D94', '#EAC4F5');
    const props = Object.keys(this.$schema); // ['companies', 'user.name']
    for (const prop of props) {
      const val = this._getControllerValue(prop);
      this._setModelValue(prop, val);
      this._debug('modelFill', `model filled:: ${prop}=${val}`, '#760D94');
    }
  }


  /**
   * Compare current controller value and stored $model values. If they are different then render the data-rg elements for the corresponding controller property.
   */
  modelWatch() {
    this._debug('modelWatch', '--------- modelWatch ------', '#760D94', '#EAC4F5');
    const props = Object.keys(this.$schema); // ['companies', 'user.name']

    let changeType = '';
    label1: for (const prop of props) {
      const dataType = this.$schema[prop]; // 'array', 'string', 'number', 'boolean'
      const valCtrl = this._getControllerValue(prop);
      const valMdl = this._getModelValue(prop);


      /* A) check the controller property type (if the controller property data type is modified then render that property) */
      if (/array/i.test(dataType) && !Array.isArray(valCtrl)) {  }
      else if (/string/i.test(dataType) && typeof valCtrl !== 'string') { changeType = 'dataType-string'; }
      else if (/number/i.test(dataType) && typeof valCtrl !== 'number') { changeType = 'dataType-number'; }
      else if (/boolean/i.test(dataType) && typeof valCtrl !== 'boolean') { changeType = 'dataType-boolean'; }
      else if (/bigint/i.test(dataType) && typeof valCtrl !== 'bigint') { changeType = 'dataType-bigint'; }
      else if (/symbol/i.test(dataType) && typeof valCtrl !== 'symbol') { changeType = 'dataType-symbol'; }

      /* B) check the controller property value (if the controller property value is modified then render that property) */
      if (!changeType) {
        if (Array.isArray(valCtrl)) { // ARRAY

          if (valCtrl && valMdl && valCtrl.length !== valMdl.length) { // first compare the array lengths
            changeType = 'array-length';
          } else { // if the array lengths are same then compare array elements
            let key = 0;
            label2: for (const elem of valCtrl) {
              if (elem !== valMdl[key]) { changeType = 'array-element'; break label2; }
              key++;
            }
          }

        } else { // PRIMITIVE DATA TYPES
          if (valCtrl !== valMdl) {
            changeType = 'primitive-value';
          }
        }
      }

      // set the $model property value
      const val = this._getControllerValue(prop);
      this._setModelValue(prop, val);

      this._debug('modelWatch', `prop: ${prop} -- dataType: ${dataType} --  valCtrl: ${valCtrl} vs. valMdl: ${valMdl} => changeType: ${changeType}`, '#760D94');
    }

    if (changeType) { this.render(); }

  }



  /******** EXTERNAL METHODS *******/
  /**
   * Set the model schema.
   * @param {object} sch - model schema object: {'companies': 'array', 'user.name': 'string'}
   */
  modelSchema(sch) {
    this.$schema = sch;
  }


  /**
   * Update the $model property and re-render the corresponding data-rg elements. This is used to render data-rg- elemsnts on the stream of data.
   * @param {string} prop - the $model and controller property name: 'company.name'
   * @param {any} val - the $model property value
   */
  async modelSet(prop, val) {
    this._debug('modelSet', '--------- modelSet ------', '#760D94', '#EAC4F5');

    // check if the property name is in the schema
    const props = Object.keys(this.$schema); // ['companies', 'user.name']
    if (props.indexOf(prop) === -1) { console.error(`modelSetErr:: The controller property ${prop} is not in the model $schema.`); return;}

    this._setModelValue(prop, val);
    this._setControllerValue(prop, val);
    if (this._debug().modelSet) { console.log('modelSet:: $model=', this.$model); }
    await this.render();
  }


  /**
   * Set the $model to empty object {} or undefine one $model property and re-render the data-rg elements.
   * @param {string} prop - the $model and controller property name: 'company.name'
   */
  modelReset(prop) {
    this._debug('modelReset', '--------- modelReset ------', '#760D94', '#EAC4F5');

    const props = !!prop ? [prop] : Object.keys(this.$schema); // ['companies', 'user.name']

    // check if the property name is in the schema
    if (!!prop && props.indexOf(prop) === -1) { console.error(`modelResetErr:: The controller property ${prop} is not in the model $schema.`); return;}

    for (const prop of props) {
      const val = undefined;
      this._setModelValue(prop, val);
      this._setControllerValue(prop, val);
      this._debug('modelReset', `modelReset:: ${prop}=${val}`, '#760D94');
    }
    this.render();
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
