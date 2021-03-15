class Util {

  /**
   * Time delay
   * @param {number} ms - miliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}


module.exports = new Util();
