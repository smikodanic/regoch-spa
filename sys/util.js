class Util {

  constructor() {
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}


module.exports = new Util();
