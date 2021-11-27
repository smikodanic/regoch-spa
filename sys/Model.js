const Page = require('./Page');


class Model extends Page {

  constructor() {
    super();
    this.$model = {};
    this._proxer();
    this._modelMethods();
  }


  /**
   * Proxy the this.$model object.
   */
  _proxer() {
    const trapHandler = {
      set: (obj, prop, value) => {
        const tf = Reflect.set(obj, prop, value);
        this.render(prop);
        return tf;
      }
    };

    this.$model = new Proxy(this.$model, trapHandler);
  }



  /**
   * Define model methods, for example: this.model('pets').push('dog');
   * @returns [any[]]
   */
  _modelMethods() {
    this.model = (modelName) => {
      const methods = {
        schema: (schemaDef) => {
          this.$schema[modelName] = schemaDef;
        },

        mrender: () => {
          this.render(modelName);
        },

        setValue: (val) => {
          this.$model[modelName] = val;
        },

        getValue: () => {
          return this.$model[modelName];
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

  }




}


module.exports = Model;
