class Util {

  constructor(separator, debug) {
    this.separator = separator || '@@',
    this.debug = debug || {
      rgKILL: false,
      rgHref: false,
      rgClick: false,
      rgPrint: false,
      rgSet: false,
      loadView: false
    };
  }


  /**
   * Delay
   * @param {number} ms - miliseconds
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * Debugger. Use it as this.debugger(var1, var2, var3)
   * @param {string} tip - debug label
   * @param {string} text - print text
   * @param {string} color - text color
   * @param {string} background - text background color
   * @returns {void}
   */
  debugger(tip, text, color, background) {
    if (this.debug[tip]) { console.log(`%c ${text}`, `color: ${color}; background: ${background}`); }
  }



}


module.exports = Util;
