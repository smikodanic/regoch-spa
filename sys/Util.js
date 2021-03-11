class Util {

  constructor(debug) {
    this.debug = debug;
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}


module.exports = Util;
