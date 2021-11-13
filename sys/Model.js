const Page = require('./Page');

/**
 * Data modelling by the defining schema:
 * {
      name: 'string',
      age: 'number',
      isActive: 'boolean',
      company: {
        name: 'string',
        employers: 'string[]',
        years: 'number[]'
      }
    }
 */
class Model extends Page {

  constructor() {
    super();
    this.paths = [];
  }


  model(name, schema) {
    console.log('name::', name);
    console.log('schema::', schema);
    this._decompose(schema);
    console.log('paths::', this.paths);

    for (const path of this.paths) {
      this._proxer(name, path);
    }
  }



  /**
   * Get the type of the schema property.
   * @param {object} schema - schema: {x: 'string', y: 'number', z: {a: 'boolean'}}
   * @param {string} prop - the schema property: x
   * @returns
   */
  _getType(schema, prop) {
    let type;
    if (typeof schema[prop] === 'string') { // primitive data types
      type = schema[prop];
    } else if (typeof schema[prop] === 'object') { // object data types
      type = 'object';
    }
    return type;
  }


  /**
   * Convert schema to array of the schema paths.
   * For example: {x: 'string', y: 'number', z: {a: 'boolean'}} --> ['x', 'y', 'z', 'z.a']
   * @param {object} schema - schema: {x: 'string', y: 'number', z: {a: 'boolean'}}
   */
  _decompose(schema) {
    const props = Object.keys(schema);
    for (const prop of props) {
      const path = prop;
      this.paths.push(path);

      const propType = this._getType(schema, prop);
      if (propType === 'object') {
        const props2 = Object.keys(schema[prop]);
        for (const prop2 of props2) {
          const path2 = `${path}.${prop2}`;
          this.paths.push(path2);
        }
      }

    }
  }




  _proxer(name, path) {
    // if (this[name]) { throw new Error(`Model Error:: The controller property ${name} is already defined.`); }

    const trapHandler = {
      // get(obj, prop) {
      //   if (typeof obj[prop] === 'object' && obj[prop] !== null && !reg.test(prop)) {
      //     return new Proxy(obj[prop], handler);
      //   } else {
      //     return obj[prop];
      //   }
      // },
      set: (obj, prop, value) => {
        const tf = Reflect.set(obj, prop, value);
        console.log('obj::', obj);
        console.log('prop::', prop);
        console.log('value::', value);
        this.render(prop);
        return tf;
      }
    };

    this[name] = new Proxy(this[name], trapHandler);
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


module.exports = Model;
