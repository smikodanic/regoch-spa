const View = require('./View');


class Model extends View {

  constructor() {
    super();
    this.$model = {};
    this.$modeler = {};
    this._modeler();
    this._proxer();
  }


  /**
   * Proxy the this.$model object.
   */
  _proxer() {
    const trapHandler = {
      set: (obj, prop, value) => {
        // console.log('obj-before::', { ...obj });
        // console.log('prop::', prop);
        // console.log('value::', value);
        const tf = Reflect.set(obj, prop, value);
        // console.log('obj-after::', obj);
        this.render(prop);
        return tf;
      }
    };

    this.$model = new Proxy(this.$model, trapHandler);
  }



  /**
   * Define model methods, for example: this.$model.use('pets').push('dog');
   * @returns [any[]]
   */
  _modeler() {
    this.$modeler.use = (modelName) => {
      const methods = {
        schema: (schemaDef) => {
          this.$schema[modelName] = schemaDef;
        },

        mrender: () => {
          this.render(modelName);
        },

        /**
         * Set the model value
         * @param {any} val - the model value at certain path
         * @param {string} path - the $model property path, for example 'product.name'
         */
        setValue: (val, path) => {
          const prop = !!path ? `${modelName}.${path}` : modelName;
          this._setModelValue(prop, val); // see Aux class
        },

        getValue: (path) => {
          const prop = !!path ? `${modelName}.${path}` : modelName;
          const val = this._getModelValue(prop);
          return val;
        },

        mpush: (arrElem) => {
          this.$model[modelName].push(arrElem);
          this.render(modelName);
        },

        mpop: () => {
          this.$model[modelName].pop();
          this.render(modelName);
        },

        munshift: (arrElem) => {
          this.$model[modelName].unshift(arrElem);
          this.render(modelName);
        },

        mshift: () => {
          this.$model[modelName].shift();
          this.render(modelName);
        }
      };

      return methods;
    };


    // delete all $model properties
    this.$modeler.emptyModel = () => {
      for (const modelProp of Object.keys(this.$model)) {
        delete this.$model[modelProp];
      }
    };

  }


  /**
   * Check if the this.$model is empty object
   * @returns {boolean}
   */
  isModelEmpty() {
    let countProps = 0;
    for (const modelProp of Object.keys(this.$model)) {
      if (typeof this.$model[modelProp] !== 'function') { countProps++; } // don't count proerties which are functions, like $model.use()
    }
    return !countProps;
  }




}


module.exports = Model;
