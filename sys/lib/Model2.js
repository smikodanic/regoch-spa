class Model2 {

  /**
   * @param {Controller} ctrl - controller instance
   * @param {string} controllerProps - controller properties to be monitored: ['companies', 'user.name']
   * @param {number} watchInterval - time interval in which controllerProps will be monitored
   */
  constructor(controllerProps = [], ctrl) {
    this.controllerProps = controllerProps;
    this.ctrl = ctrl;

    this.$model = {}; // copy of the controllerProps values -> this.$model = {companies: ['Cloud Ltd', 'ABC Ltd], user: {name: 'John Doe'}}
    this.debugOpts = {
      fill: false,
      watch: false,
      watchStart: false,
      watchStop: false,
      set: false,
      reset: false,
    };
  }



  /**
   * Copy controller values ('this.company.name') to the $model values ('this.$model.company.name).
   * The this.$model is the previous model value and it's compared with the current controller value. For example: this.company.name vs. this.$model.company.name .
   */
  fill() {
    this._debug('fill', `--------- fill  (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');
    for (const prop of this.controllerProps) {
      const val = this.ctrl._getControllerValue(prop);
      this._setModelValue(prop, val);
      this._debug('fill', `model filled:: ${prop}=${JSON.stringify(val)}`, '#32938C');
    }
  }


  /**
   * ** Model Watch Loop **
   * Compare current controller value and stored $model values.
   * If they are different then render the data-rg elements for the corresponding controller property.
   */
  watch() {
    this._debug('watch', `--------- watch (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');
    const props = this.controllerProps;
    if (!props.length) { return; }

    let changeType = '';
    label1: for (const prop of props) {
      const valCtrl = this.ctrl._getControllerValue(prop);
      let valMdl = this._getModelValue(prop);

      /* check the controller property value (if the controller property value is modified then render that property) */
      if (!changeType) {
        if (Array.isArray(valCtrl)) { // ARRAY

          if (!valMdl) { valMdl = []; } // correct if valMdl is not defined

          if (valCtrl && valMdl && valCtrl.length !== valMdl.length) { // first compare the array lengths
            changeType = 'array-length';
          } else { // if the array lengths are same then compare array elements
            let key = 0;
            label2: for (const elem of valCtrl) {
              if (typeof elem === 'object') { changeType = 'array-elementObject'; break label2; }
              else if (elem !== valMdl[key]) { changeType = 'array-elementPrimitive'; break label2; }
              key++;
            }
          }

        } else { // PRIMITIVE DATA TYPES
          if (typeof valCtrl !== 'object' && valCtrl !== valMdl) {
            changeType = 'primitive-value';
          } else if (typeof valCtrl === 'object') {
            changeType = 'object-value';
          }
        }
      }


      if (this._debug().watch) { console.log('watch:: prop:', prop, ' -- valCtrl:', valCtrl, ' vs. valMdl:', valMdl, ' => changeType:', changeType); }
      if (changeType) { this.ctrl.render(prop); }
      changeType = '';
    }


    this.fill();
  }


  /**
   * Start the model monitoring.
   * @param {number} msInt - watching period in miliseconds
   */
  watchStart(msInt = 400) {
    this._debug('watchStart', `--------- watchStart (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');
    if (this.intervalID) { console.log(`%c ModelWarn:: Watch is already running.`, `color:Maroon; background:LightYellow`); return; }
    const watch = this.watch.bind(this);
    this.intervalID = setInterval(watch, msInt);
  }


  /**
   * Stop the model monitoring.
   */
  watchStop() {
    this._debug('watchStop', `--------- watchStop (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');
    if (this.intervalID) { clearInterval(this.intervalID); }
  }



  /**
   * Update the $model property and re-render the corresponding data-rg elements. This is used to render data-rg- elemsnts on the stream of data.
   * @param {string} prop - the $model and controller property name: 'company.name'
   * @param {any} val - the $model property value
   */
  set(prop, val) {
    this._debug('set', `--------- set  (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');

    // check if the property name is in the schema
    const props = this.controllerProps;
    if (props.indexOf(prop) === -1) { console.error(`setErr:: The controller property ${prop} is not in the $modelDef.`); return; }

    this._setModelValue(prop, val);
    this.ctrl._setControllerValue(prop, val);
    if (this._debug().set) { console.log('set:: $model=', this.$model); }
    this.ctrl.render(prop);
  }



  /**
   * Undefine the $model and controller properties and re-render the data-rg elements.
   * @param {string} prop - the $model and controller property name: 'company.name'
   */
  reset(prop) {
    this._debug('reset', `--------- reset  (ctrl: ${this.ctrl.constructor.name})------`, '#32938C', '#BAF6F2');

    const props = !!prop ? [prop] : this.controllerProps;

    // check if the property name is in the schema
    if (!!prop && props.indexOf(prop) === -1) { console.error(`resetErr:: The controller property ${prop} is not in the $modelDef.`); return; }

    for (const prop of props) {
      const val = undefined;
      this._setModelValue(prop, val);
      this.ctrl._setControllerValue(prop, val);
      this._debug('reset', `reset:: ${prop}=${val}`, '#32938C');
    }
    this.ctrl.render();
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
        if (typeof val === 'object' && !Array.isArray(val)) { obj[prop] = { ...val }; }
        if (typeof val === 'object' && Array.isArray(val)) { obj[prop] = [...val]; }
        else { obj[prop] = val; }
      }
      i++;
    }
  }

  /**
   * Debug the controller methods.
   * @param {string} tip - debug type: rgprint, render, ...
   * @param {string} text - the printed text
   * @param {string} color - text color
   * @param {string} background - background color
   * @returns {object}
   */
  _debug(tip, text, color, background) {
    if (this.debugOpts[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
    return this.debugOpts;
  }


}


module.exports = Model2;
